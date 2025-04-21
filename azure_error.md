2025-04-21T21:14:01.777Z INFO  - Starting container for site
2025-04-21T21:14:01.785Z INFO  - docker run -d --expose=8080 --name humblemeplz_0_b994dfe4 -e WEBSITE_USE_DIAGNOSTIC_SERVER=true -e WEBSITE_SITE_NAME=humblemeplz -e WEBSITE_AUTH_ENABLED=False -e WEBSITE_ROLE_INSTANCE_ID=0 -e WEBSITE_HOSTNAME=humblemeplz.azurewebsites.net -e WEBSITE_INSTANCE_ID=bcf44d659ba300c7830a43c66f543def03d4ae7e888c5d45ba7b064e17b52927 -e NODE_OPTIONS=--require /agents/nodejs/build/src/Loader.js appsvc/node:20-lts_20250303.1.tuxprod
2025-04-21T21:14:01.786Z INFO  - Logging is not enabled for this container.Please use https://aka.ms/linux-diagnostics to enable logging to see container logs here.
2025-04-21T21:14:07.036Z INFO  - Initiating warmup request to container humblemeplz_0_b994dfe4 for site humblemeplz
2025-04-21T21:14:05.376120048Z    _____
2025-04-21T21:14:05.376202488Z   /  _  \ __________ _________   ____
2025-04-21T21:14:05.376206431Z  /  /_\  \\___   /  |  \_  __ \_/ __ \
2025-04-21T21:14:05.376209123Z /    |    \/    /|  |  /|  | \/\  ___/
2025-04-21T21:14:05.376211569Z \____|__  /_____ \____/ |__|    \___  >
2025-04-21T21:14:05.376214365Z         \/      \/                  \/
2025-04-21T21:14:05.376216741Z A P P   S E R V I C E   O N   L I N U X
2025-04-21T21:14:05.376219034Z
2025-04-21T21:14:05.376221200Z Documentation: http://aka.ms/webapp-linux
2025-04-21T21:14:05.376223734Z NodeJS quickstart: https://aka.ms/node-qs
2025-04-21T21:14:05.376225981Z NodeJS Version : v20.18.3
2025-04-21T21:14:05.376228263Z Note: Any data outside '/home' is not persisted
2025-04-21T21:14:05.376231097Z
2025-04-21T21:14:09.172926224Z Starting OpenBSD Secure Shell server: sshd.
2025-04-21T21:14:09.211362234Z WEBSITES_INCLUDE_CLOUD_CERTS is not set to true.
2025-04-21T21:14:09.261965645Z Updating certificates in /etc/ssl/certs...
2025-04-21T21:14:24.040888000Z rehash: warning: skipping ca-certificates.crt,it does not contain exactly one certificate or CRL
2025-04-21T21:14:24.111636795Z 2 added, 0 removed; done.
2025-04-21T21:14:24.112557107Z Running hooks in /etc/ca-certificates/update.d...
2025-04-21T21:14:24.150822763Z done.
2025-04-21T21:14:24.172184322Z CA certificates copied and updated successfully.
2025-04-21T21:14:24.552378438Z Starting periodic command scheduler: cron.
2025-04-21T21:14:25.147703053Z Could not find build manifest file at '/home/site/wwwroot/oryx-manifest.toml'
2025-04-21T21:14:25.147732317Z Could not find operation ID in manifest. Generating an operation id...
2025-04-21T21:14:25.147735636Z Build Operation ID: a170da1b-22c4-405c-a0c1-921bb30ac1f1
2025-04-21T21:14:25.649201539Z Environment Variables for Application Insight's IPA Codeless Configuration exists..
2025-04-21T21:14:25.699694091Z Writing output script to '/opt/startup/startup.sh'
2025-04-21T21:14:25.841802969Z Running #!/bin/sh
2025-04-21T21:14:25.841829375Z
2025-04-21T21:14:25.841832675Z # Enter the source directory to make sure the script runs where the user expects
2025-04-21T21:14:25.841835575Z cd "/home/site/wwwroot"
2025-04-21T21:14:25.841838089Z
2025-04-21T21:14:25.841840341Z export NODE_PATH=/usr/local/lib/node_modules:$NODE_PATH
2025-04-21T21:14:25.841842761Z if [ -z "$PORT" ]; then
2025-04-21T21:14:25.841845298Z 		export PORT=8080
2025-04-21T21:14:25.841847938Z fi
2025-04-21T21:14:25.841850527Z
2025-04-21T21:14:25.861407670Z npm start
2025-04-21T21:14:34.572138373Z npm info using npm@10.8.2
2025-04-21T21:14:34.572918393Z npm info using node@v20.18.3
2025-04-21T21:14:38.336946256Z
2025-04-21T21:14:38.336976701Z > humblemeplz@1.0.0 start
2025-04-21T21:14:38.336980230Z > next start
2025-04-21T21:14:38.336982856Z
2025-04-21T21:14:41.264269959Z node:internal/modules/cjs/loader:1228
2025-04-21T21:14:41.264298231Z   throw err;
2025-04-21T21:14:41.264301376Z   ^
2025-04-21T21:14:41.264304010Z
2025-04-21T21:14:41.264306384Z Error: Cannot find module '../server/require-hook'
2025-04-21T21:14:41.264308752Z Require stack:
2025-04-21T21:14:41.264311120Z - /home/site/wwwroot/node_modules/.bin/next
2025-04-21T21:14:41.264313638Z     at Module._resolveFilename (node:internal/modules/cjs/loader:1225:15)
2025-04-21T21:14:41.264316122Z     at Module._load (node:internal/modules/cjs/loader:1051:27)
2025-04-21T21:14:41.264318478Z     at Module.require (node:internal/modules/cjs/loader:1311:19)
2025-04-21T21:14:41.264320791Z     at Module.patchedRequire [as require] (/agents/nodejs/node_modules/diagnostic-channel/dist/src/patchRequire.js:16:46)
2025-04-21T21:14:41.264329682Z     at require (node:internal/modules/helpers:179:18)
2025-04-21T21:14:41.264332106Z     at Object.<anonymous> (/home/site/wwwroot/node_modules/.bin/next:6:1)
2025-04-21T21:14:41.264335256Z     at Module._compile (node:internal/modules/cjs/loader:1469:14)
2025-04-21T21:14:41.264337670Z     at Module._extensions..js (node:internal/modules/cjs/loader:1548:10)
2025-04-21T21:14:41.264340061Z     at Module.load (node:internal/modules/cjs/loader:1288:32)
2025-04-21T21:14:41.264342347Z     at Module._load (node:internal/modules/cjs/loader:1104:12) {
2025-04-21T21:14:41.264344642Z   code: 'MODULE_NOT_FOUND',
2025-04-21T21:14:41.264347078Z   requireStack: [ '/home/site/wwwroot/node_modules/.bin/next' ]
2025-04-21T21:14:41.264349545Z }
2025-04-21T21:14:41.273763963Z
2025-04-21T21:14:41.273795016Z Node.js v20.18.3
2025-04-21T21:14:41.294906623Z npm http fetch GET 200 https://registry.npmjs.org/npm 1126ms
2025-04-21T21:14:41.324407263Z npm notice
2025-04-21T21:14:41.324448707Z npm notice New major version of npm available! 10.8.2 -> 11.3.0
2025-04-21T21:14:41.324453250Z npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.3.0
2025-04-21T21:14:41.324456085Z npm notice To update run: npm install -g npm@11.3.0
2025-04-21T21:14:41.324459317Z npm notice
2025-04-21T21:14:40.397Z INFO  - Waiting for response to warmup request for container humblemeplz_0_b994dfe4. Elapsed time = 33.339893 sec
2025-04-21T21:14:41.675Z ERROR - Container humblemeplz_0_b994dfe4 for site humblemeplz has exited, failing site start
2025-04-21T21:14:41.690Z ERROR - Container humblemeplz_0_b994dfe4 didn't respond to HTTP pings on port: 8080. Failing site start. See container logs for debugging.
2025-04-21T21:14:41.708Z INFO  - Stopping site humblemeplz because it failed during startup.