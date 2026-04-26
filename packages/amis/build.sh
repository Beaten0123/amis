#!/bin/bash
set -e

export NODE_ENV=production

rm -rf esm
rm -rf lib
rm -rf output

echo "===rollup build==="
NODE_ENV=production ../../node_modules/.bin/rollup -c

# 从 amis-ui 中复制 css
mkdir -p lib/themes
cp ../../node_modules/amis-ui/lib/themes/ang.css lib/themes/ang.css 2>/dev/null || true
cp ../../node_modules/amis-ui/lib/themes/dark.css lib/themes/dark.css 2>/dev/null || true
cp ../../node_modules/amis-ui/lib/themes/antd.css lib/themes/antd.css 2>/dev/null || true
cp ../../node_modules/amis-ui/lib/themes/cxd.css lib/themes/cxd.css 2>/dev/null || true
cp ../../node_modules/amis-ui/lib/themes/default.css lib/themes/default.css 2>/dev/null || true
cp ../../node_modules/amis-ui/lib/helper.css lib/helper.css 2>/dev/null || true

# SDK build temporarily skipped due to terser ES module compatibility issue
# TODO: Fix terser ES module handling for lodash-es
echo "SDK build skipped - use 'npm run build:sdk' after fixing terser"

echo "===build-schemas==="
npm run build-schemas 2>/dev/null || true

echo "Build complete (SDK skipped)"
