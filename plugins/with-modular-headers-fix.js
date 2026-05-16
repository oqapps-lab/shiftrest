/**
 * Verbatim from Vitaminico launch playbook (verified working 2026-05-08).
 * See /Users/evgenij/Desktop/work/APP_DEVELOPMENT/_LAUNCH_PLAYBOOK/skill/SKILL.md
 * Pitfall #4 for context.
 *
 * Fix: inject CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES
 * INSIDE the existing post_install block in the Expo-prebuild Podfile.
 *
 * DO NOT add use_modular_headers! — that breaks worse.
 * DO NOT add a second post_install block — pod install crashes.
 * DO NOT useFrameworks: dynamic — Firebase Swift pods refuse to link.
 *
 * Two-part fix per playbook:
 *   1. RNFB pinned to 22.4.0 exactly (NOT v23+, last version without strict enforcement)
 *   2. This plugin
 */
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function patchRNFBHeaders(projectRoot) {
  const rnfbDir = path.join(projectRoot, 'node_modules', '@react-native-firebase');
  if (!fs.existsSync(rnfbDir)) return 0;
  let patched = 0;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules') continue;
        walk(p);
      } else if (e.name.endsWith('.h') || e.name.endsWith('.m')) {
        let src = fs.readFileSync(p, 'utf8');
        const before = src;
        src = src.replace(/^#import\s+<React\/[^>]+\.h>\s*$/gm, '@import React;');
        src = src.replace(/^#import\s+<RCTRequired\/[^>]+\.h>\s*$/gm, '@import RCTRequired;');
        src = src.replace(/^#import\s+<RCTTypeSafety\/[^>]+\.h>\s*$/gm, '@import RCTTypeSafety;');
        if (src !== before) {
          fs.writeFileSync(p, src);
          patched++;
        }
      }
    }
  };
  walk(rnfbDir);
  return patched;
}

const MARKER = '# RNFB-static-framework-fix-v3-marker';

const POST_INSTALL_INJECTION = `    # ${MARKER.replace('# ', '')}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |bc|
        bc.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end`;

// Top-of-file globals: $RNFirebaseAsStaticFramework=true forces RNFB pods
// to be linked as static libs even when use_frameworks! is dynamic. Required
// when combining Firebase Crashlytics / Auth / etc. with use_frameworks.
// See https://rnfirebase.io/#allow-ios-static-frameworks
const HEADER_GLOBALS = `# ${MARKER.replace('# ', '')}
$RNFirebaseAsStaticFramework = true

`;

module.exports = function withModularHeadersFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const n = patchRNFBHeaders(projectRoot);
      console.log(`[with-modular-headers-fix] patched ${n} RNFB headers`);

      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      if (!fs.existsSync(podfilePath)) return cfg;
      let podfile = fs.readFileSync(podfilePath, 'utf8');
      if (podfile.includes(MARKER.replace('# ', ''))) return cfg;

      podfile = HEADER_GLOBALS + podfile;

      const re = /(post_install\s+do\s+\|installer\|\s*\n)/m;
      if (re.test(podfile)) {
        podfile = podfile.replace(re, `$1${POST_INSTALL_INJECTION}\n\n`);
      } else {
        podfile += `\npost_install do |installer|\n${POST_INSTALL_INJECTION}\nend\n`;
      }

      fs.writeFileSync(podfilePath, podfile);
      return cfg;
    },
  ]);
};
