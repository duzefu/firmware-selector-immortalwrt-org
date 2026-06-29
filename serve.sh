#!/bin/sh
#
# 本地启动固件选择器的静态站点。
#
# 用法:
#   ./serve.sh [端口]
#
# 示例:
#   ./serve.sh            # 监听默认端口 8000
#   ./serve.sh 8080       # 监听 8080
#   HOST=0.0.0.0 ./serve.sh   # 监听所有网卡, 供局域网访问
#
# 脚本会自动从可用的运行时中挑选一个 HTTP 服务器 (python3 / python / php / busybox)，
# 并把仓库的 www/ 目录作为站点根目录提供服务。

set -eu

# 切换到脚本所在目录, 保证从任意位置调用都能定位 www/
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR="$SCRIPT_DIR/www"

PORT="${1:-8000}"
HOST="${HOST:-127.0.0.1}"

if [ ! -d "$ROOT_DIR" ]; then
  echo "错误: 找不到站点目录 $ROOT_DIR" >&2
  exit 1
fi

case "$PORT" in
  *[!0-9]*|'')
    echo "错误: 端口必须是数字, 收到 '$PORT'" >&2
    exit 1
    ;;
esac

URL="http://$HOST:$PORT/"

echo "站点根目录: $ROOT_DIR"
echo "访问地址:   $URL"
echo "(按 Ctrl+C 停止)"
echo

cd "$ROOT_DIR"

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT" --bind "$HOST"
elif command -v python >/dev/null 2>&1; then
  # Python 2 的 SimpleHTTPServer 不支持 --bind, 退而监听全部网卡
  exec python -m SimpleHTTPServer "$PORT"
elif command -v php >/dev/null 2>&1; then
  exec php -S "$HOST:$PORT"
elif command -v busybox >/dev/null 2>&1; then
  exec busybox httpd -f -p "$HOST:$PORT" -h "$ROOT_DIR"
else
  echo "错误: 未找到可用的 HTTP 服务器 (需要 python3 / python / php / busybox 之一)" >&2
  exit 1
fi
