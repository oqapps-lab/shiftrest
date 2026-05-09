/**
 * Expo config plugin — fix RNFB v22 + useFrameworks:"static" non-modular header errors.
 *
 * Injects a post_install hook into the generated Podfile that sets
 * CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES on every pod
 * build configuration, allowing RNFBApp to include React-Core non-modular
 * headers (e.g. <React/RCTConvert.h>) without -Wnon-modular-include-in-
 * framework-module errors.
 *
 * Verbatim from sugar-quit launch playbook (Vitaminico verified 2026-05-08).
 * MUST be the LAST plugin in app.json's plugins array — runs after Expo's
 * own Podfile generation to amend the post_install block.
 */

const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MARKER = '# RNFB-non-modular-headers-fix-marker';

const INJECTION = `    # ${MARKER.replace('# ', '')}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |bc|
        bc.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end`;

module.exports = function withModularHeadersFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      if (!fs.existsSync(podfilePath)) return cfg;
      let podfile = fs.readFileSync(podfilePath, 'utf8');
      if (podfile.includes(MARKER.replace('# ', ''))) return cfg;
      const re = /(post_install\s+do\s+\|installer\|\s*\n)/m;
      if (re.test(podfile)) {
        podfile = podfile.replace(re, `$1${INJECTION}\n\n`);
      } else {
        podfile += `\npost_install do |installer|\n${INJECTION}\nend\n`;
      }
      fs.writeFileSync(podfilePath, podfile);
      return cfg;
    },
  ]);
};
