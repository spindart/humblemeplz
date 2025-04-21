2025-04-21T22:06:31.575427556Z <w> [webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: ENOENT: no such file or directory, lstat '/home/site/wwwroot/.next/server/vendor-chunks'
2025-04-21T22:06:32.572714700Z <w> [webpack.cache.PackFileCacheStrategy/webpack.FileSystemInfo] Resolving './vendor-chunks/next' in /home/site/wwwroot/.next/server for build dependencies doesn't lead to expected result '/home/site/wwwroot/.next/server/vendor-chunks/next.js', but to 'Error: Can't resolve './vendor-chunks/next' in '/home/site/wwwroot/.next/server'' instead. Resolving dependencies are ignored for this path.
2025-04-21T22:06:32.572764968Z <w>  at resolve commonjs file ./vendor-chunks/next (expected /home/site/wwwroot/.next/server/vendor-chunks/next.js)
2025-04-21T22:06:32.572768897Z <w>  at file dependencies /home/site/wwwroot/.next/server/webpack-runtime.js
2025-04-21T22:06:32.572771416Z <w>  at file /home/site/wwwroot/.next/server/webpack-runtime.js
2025-04-21T22:06:32.572774323Z <w>  at file dependencies /home/site/wwwroot/.next/server/pages/_error.js
2025-04-21T22:06:32.572776703Z <w>  at file /home/site/wwwroot/.next/server/pages/_error.js
2025-04-21T22:06:32.572779027Z <w>  at file dependencies /home/site/wwwroot/node_modules/next/dist/server/require.js
2025-04-21T22:06:32.572781460Z <w>  at file /home/site/wwwroot/node_modules/next/dist/server/require.js
2025-04-21T22:06:32.572783910Z <w>  at file dependencies /home/site/wwwroot/node_modules/next/dist/server/load-components.js
2025-04-21T22:06:32.572786314Z <w>  at file /home/site/wwwroot/node_modules/next/dist/server/load-components.js
2025-04-21T22:06:32.572788645Z <w>  at file dependencies /home/site/wwwroot/node_modules/next/dist/build/utils.js
2025-04-21T22:06:32.572790974Z <w>  at file /home/site/wwwroot/node_modules/next/dist/build/utils.js
2025-04-21T22:06:32.572793367Z <w>  at file dependencies /home/site/wwwroot/node_modules/next/dist/build/handle-externals.js
2025-04-21T22:06:32.572795717Z <w>  at file /home/site/wwwroot/node_modules/next/dist/build/handle-externals.js
2025-04-21T22:06:32.572798067Z <w>  at file dependencies /home/site/wwwroot/node_modules/next/dist/build/webpack/loaders/next-swc-loader.js
2025-04-21T22:06:32.572800559Z <w>  at file /home/site/wwwroot/node_modules/next/dist/build/webpack/loaders/next-swc-loader.js
2025-04-21T22:06:32.572803095Z <w>  at resolve commonjs /home/site/wwwroot/node_modules/next/dist/build/webpack/loaders/next-swc-loader.js
2025-04-21T22:06:47.925Z INFO  - Waiting for response to warmup request for container humblemeplz_0_47c60950. Elapsed time = 15.1812691 sec
2025-04-21T22:06:32.321718615Z    _____
2025-04-21T22:06:32.322113626Z   /  _  \ __________ _________   ____
2025-04-21T22:06:32.322117760Z  /  /_\  \\___   /  |  \_  __ \_/ __ \
2025-04-21T22:06:32.322120826Z /    |    \/    /|  |  /|  | \/\  ___/
2025-04-21T22:06:32.322123564Z \____|__  /_____ \____/ |__|    \___  >
2025-04-21T22:06:32.322126198Z         \/      \/                  \/
2025-04-21T22:06:32.322128797Z A P P   S E R V I C E   O N   L I N U X
2025-04-21T22:06:32.322131323Z
2025-04-21T22:06:32.322133643Z Documentation: http://aka.ms/webapp-linux
2025-04-21T22:06:32.322135987Z NodeJS quickstart: https://aka.ms/node-qs
2025-04-21T22:06:32.322138428Z NodeJS Version : v20.18.3
2025-04-21T22:06:32.322140967Z Note: Any data outside '/home' is not persisted
2025-04-21T22:06:32.322143456Z
2025-04-21T22:06:35.276560203Z Starting OpenBSD Secure Shell server: sshd.
2025-04-21T22:06:35.279389078Z WEBSITES_INCLUDE_CLOUD_CERTS is not set to true.
2025-04-21T22:06:35.323818247Z Updating certificates in /etc/ssl/certs...
2025-04-21T22:06:37.906057082Z rehash: warning: skipping ca-certificates.crt,it does not contain exactly one certificate or CRL
2025-04-21T22:06:37.949687683Z 2 added, 0 removed; done.
2025-04-21T22:06:37.949708316Z Running hooks in /etc/ca-certificates/update.d...
2025-04-21T22:06:37.950829169Z done.
2025-04-21T22:06:37.979151019Z CA certificates copied and updated successfully.
2025-04-21T22:06:38.070549576Z Starting periodic command scheduler: cron.
2025-04-21T22:06:38.075055663Z Could not find build manifest file at '/home/site/wwwroot/oryx-manifest.toml'
2025-04-21T22:06:38.075099600Z Could not find operation ID in manifest. Generating an operation id...
2025-04-21T22:06:38.075103407Z Build Operation ID: a35c67f2-ec8a-4860-b42b-dbc6f3226a98
2025-04-21T22:06:38.315356808Z Environment Variables for Application Insight's IPA Codeless Configuration exists..
2025-04-21T22:06:38.346980548Z Writing output script to '/opt/startup/startup.sh'
2025-04-21T22:06:38.387658737Z Running #!/bin/sh
2025-04-21T22:06:38.387695753Z
2025-04-21T22:06:38.387700124Z # Enter the source directory to make sure the script runs where the user expects
2025-04-21T22:06:38.387703484Z cd "/home/site/wwwroot"
2025-04-21T22:06:38.387706609Z
2025-04-21T22:06:38.387709530Z export NODE_PATH=/usr/local/lib/node_modules:$NODE_PATH
2025-04-21T22:06:38.387712608Z if [ -z "$PORT" ]; then
2025-04-21T22:06:38.387715719Z 		export PORT=8080
2025-04-21T22:06:38.387718986Z fi
2025-04-21T22:06:38.387721772Z
2025-04-21T22:06:38.387724490Z npm start
2025-04-21T22:06:39.800693829Z npm info using npm@10.8.2
2025-04-21T22:06:39.800751641Z npm info using node@v20.18.3
2025-04-21T22:06:40.465712827Z
2025-04-21T22:06:40.465744506Z > humblemeplz@1.0.0 start
2025-04-21T22:06:40.465749096Z > node server.js
2025-04-21T22:06:40.465752260Z
2025-04-21T22:06:49.672340355Z node:events:496
2025-04-21T22:06:49.672370433Z       throw er; // Unhandled 'error' event
2025-04-21T22:06:49.672374157Z       ^
2025-04-21T22:06:49.672377229Z
2025-04-21T22:06:49.672379700Z Error: ENOENT: no such file or directory, open '/home/site/wwwroot/.next/trace'
2025-04-21T22:06:49.672382689Z Emitted 'error' event on WriteStream instance at:
2025-04-21T22:06:49.672385412Z     at emitErrorNT (node:internal/streams/destroy:169:8)
2025-04-21T22:06:49.672388332Z     at emitErrorCloseNT (node:internal/streams/destroy:128:3)
2025-04-21T22:06:49.672390936Z     at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
2025-04-21T22:06:49.672393603Z   errno: -2,
2025-04-21T22:06:49.672395960Z   code: 'ENOENT',
2025-04-21T22:06:49.672399070Z   syscall: 'open',
2025-04-21T22:06:49.672401514Z   path: '/home/site/wwwroot/.next/trace'
2025-04-21T22:06:49.672403983Z }
2025-04-21T22:06:49.672406356Z
2025-04-21T22:06:49.672408710Z Node.js v20.18.3
2025-04-21T22:06:49.729835209Z npm http fetch GET 200 https://registry.npmjs.org/npm 248ms
2025-04-21T22:06:49.741195265Z npm notice
2025-04-21T22:06:49.741219824Z npm notice New major version of npm available! 10.8.2 -> 11.3.0
2025-04-21T22:06:49.741223830Z npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.3.0
2025-04-21T22:06:49.741226744Z npm notice To update run: npm install -g npm@11.3.0
2025-04-21T22:06:49.741229858Z npm notice
2025-04-21T22:06:49.979Z ERROR - Container humblemeplz_0_47c60950 for site humblemeplz has exited, failing site start
2025-04-21T22:06:49.997Z ERROR - Container humblemeplz_0_47c60950 didn't respond to HTTP pings on port: 8080. Failing site start. See container logs for debugging.