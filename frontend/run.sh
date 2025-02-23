# Note that these app variables will be public
echo "window._env_ = { baseApiUrl: '$BACKEND_EXTERNAL_URL' }" > "/usr/share/nginx/html/env-config.js"
exec nginx -g 'daemon off;'