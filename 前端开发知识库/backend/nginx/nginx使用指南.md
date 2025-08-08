
[官网](https://nginx.org/)
	[document](http://nginx.org/en/docs/)

[Github](https://github.com/nginx/nginx)


## 安装

### Mac OS

通过查看官网中的[document](http://nginx.org/en/docs/) 中的文档，发现并没有`mac os` 安装的介绍。于是查看`homebrew`安装流程：[hombrew安装地址](https://formulae.brew.sh/formula/nginx#default)

```bash
brew install nginx

==> Fetching nginx
==> Downloading https://ghcr.io/v2/homebrew/core/nginx/manifests/1.23.4
######################################################################## 100.0%
==> Downloading https://ghcr.io/v2/homebrew/core/nginx/blobs/sha256:e619828547bb
==> Downloading from https://pkg-containers.githubusercontent.com/ghcr1/blobs/sh
######################################################################## 100.0%
==> Installing dependencies for nginx: pcre2
==> Installing nginx dependency: pcre2
==> Pouring pcre2--10.42.arm64_ventura.bottle.tar.gz
🍺  /opt/homebrew/Cellar/pcre2/10.42: 230 files, 6.2MB
==> Installing nginx
==> Pouring nginx--1.23.4.arm64_ventura.bottle.tar.gz
==> Caveats
Docroot is: /opt/homebrew/var/www

The default port has been set in /opt/homebrew/etc/nginx/nginx.conf to 8080 so that
nginx can run without sudo.

nginx will load all files in /opt/homebrew/etc/nginx/servers/.

To restart nginx after an upgrade:
  brew services restart nginx
Or, if you don't want/need a background service you can just run:
  /opt/homebrew/opt/nginx/bin/nginx -g daemon off;
==> Summary
🍺  /opt/homebrew/Cellar/nginx/1.23.4: 26 files, 2.2MB
==> Running `brew cleanup nginx`...
Disable this behaviour by setting HOMEBREW_NO_INSTALL_CLEANUP.
Hide these hints with HOMEBREW_NO_ENV_HINTS (see `man brew`).
==> Upgrading 1 dependent of upgraded formulae:
Disable this behaviour by setting HOMEBREW_NO_INSTALLED_DEPENDENTS_CHECK.
Hide these hints with HOMEBREW_NO_ENV_HINTS (see `man brew`).
git 2.36.1 -> 2.40.0
==> Fetching dependencies for git: gettext
==> Fetching gettext
==> Downloading https://ghcr.io/v2/homebrew/core/gettext/manifests/0.21.1
######################################################################## 100.0%
==> Downloading https://ghcr.io/v2/homebrew/core/gettext/blobs/sha256:28c5b06e66
==> Downloading from https://pkg-containers.githubusercontent.com/ghcr1/blobs/sh
######################################################################## 100.0%
==> Fetching git
==> Downloading https://ghcr.io/v2/homebrew/core/git/manifests/2.40.0
######################################################################## 100.0%
==> Downloading https://ghcr.io/v2/homebrew/core/git/blobs/sha256:bfa99673257b83
==> Downloading from https://pkg-containers.githubusercontent.com/ghcr1/blobs/sh
######################################################################## 100.0%
==> Upgrading git
  2.36.1 -> 2.40.0

==> Installing dependencies for git: gettext
==> Installing git dependency: gettext
==> Pouring gettext--0.21.1.arm64_ventura.bottle.tar.gz
🍺  /opt/homebrew/Cellar/gettext/0.21.1: 1,983 files, 20.9MB
==> Installing git
==> Pouring git--2.40.0.arm64_ventura.bottle.tar.gz
==> Caveats
The Tcl/Tk GUIs (e.g. gitk, git-gui) are now in the `git-gui` formula.
Subversion interoperability (git-svn) is now in the `git-svn` formula.

zsh completions and functions have been installed to:
  /opt/homebrew/share/zsh/site-functions
==> Summary
🍺  /opt/homebrew/Cellar/git/2.40.0: 1,625 files, 48.6MB
==> Running `brew cleanup git`...
Removing: /opt/homebrew/Cellar/git/2.36.1... (1,545 files, 44.1MB)
==> Checking for dependents of upgraded formulae...
==> No broken dependents found!
==> `brew cleanup` has not been run in the last 30 days, running now...
Disable this behaviour by setting HOMEBREW_NO_INSTALL_CLEANUP.
Hide these hints with HOMEBREW_NO_ENV_HINTS (see `man brew`).
Removing: /opt/homebrew/Cellar/gettext/0.21... (1,953 files, 20.6MB)
Removing: /opt/homebrew/Cellar/pcre2/10.40... (230 files, 6.1MB)
Removing: /Users/xxx/Library/Caches/Homebrew/redis--7.0.8... (1006KB)
Removing: /Users/xxx/Library/Caches/Homebrew/pnpm_bottle_manifest--7.18.1... (7.7KB)
Removing: /Users/xxx/Library/Logs/Homebrew/redis... (64B)
Removing: /Users/xxx/Library/Logs/Homebrew/ca-certificates... (64B)
Removing: /Users/xxx/Library/Logs/Homebrew/openssl@1.1... (64B)
Pruned 0 symbolic links and 1 directories from /opt/homebrew
==> Caveats
==> nginx
Docroot is: /opt/homebrew/var/www

The default port has been set in /opt/homebrew/etc/nginx/nginx.conf to 8080 so that
nginx can run without sudo.

nginx will load all files in /opt/homebrew/etc/nginx/servers/.

To restart nginx after an upgrade:
  brew services restart nginx
Or, if you don't want/need a background service you can just run:
  /opt/homebrew/opt/nginx/bin/nginx -g daemon off;
==> git
The Tcl/Tk GUIs (e.g. gitk, git-gui) are now in the `git-gui` formula.
Subversion interoperability (git-svn) is now in the `git-svn` formula.

zsh completions and functions have been installed to:
  /opt/homebrew/share/zsh/site-functions
```

查看是否安装成功

```bash
nginx -v
nginx version: nginx/1.23.4
```

## 常用命令

```
# 启动
nginx

# 暂停
nginx -s stop

# 暂停
nginx -s stop

#优雅退出（停止nginx进程，等待工作进程完成对当前请求的服务）
nginx -s quit

# 重新加载配置文件
nginx -s reload

# 检查配置文件并输出配置文件位置
nginx -t
```

## 配置文件（nginx.conf）

默认生产的配置文件如下：
```nginx.conf
#user  nobody;
worker_processes 1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;
events {
    worker_connections 1024;
}


http {
    include mime.types;
    default_type application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;
    sendfile on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout 65;

    #gzip  on;
    
    server {
        listen 80;
        server_name localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;
        location / {
            root html;
            index index.html index.htm;
        }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root html;
        }

        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}

        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}
        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #    deny  all;
        #}
    }

    #server {
    #	resolver 114.114.114.114;       #指定DNS服务器IP地址
    #	listen 8080;
    #	location / {
    #	   	proxy_pass http://$http_host$request_uri;
    #	}
    #    }
    # another virtual host using mix of IP-, name-, and port-based configuration
    #
    #server {
    #    listen       8000;
    #    listen       somename:8080;
    #    server_name  somename  alias  another.alias;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}
    # HTTPS server
    #
    #server {
    #    listen       443 ssl;
    #    server_name  localhost;
    #    ssl_certificate      cert.pem;
    #    ssl_certificate_key  cert.key;
    #    ssl_session_cache    shared:SSL:1m;
    #    ssl_session_timeout  5m;
    #    ssl_ciphers  HIGH:!aNULL:!MD5;
    #    ssl_prefer_server_ciphers  on;
    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}
    include servers/*;
}
```


## 初学者指南（Beginner’s Guide）
源自官网文档[Beginner’s Guide](https://nginx.org/en/docs/beginners_guide.html)

[Starting, Stopping, and Reloading Configuration](https://nginx.org/en/docs/beginners_guide.html#control)

[Configuration File’s Structure](https://nginx.org/en/docs/beginners_guide.html#conf_structure)

[Serving Static Content](https://nginx.org/en/docs/beginners_guide.html#static)

[Setting Up a Simple Proxy Server](https://nginx.org/en/docs/beginners_guide.html#proxy)

[Setting Up FastCGI Proxying](https://nginx.org/en/docs/beginners_guide.html#fastcgi)


## 内网穿透工具

[ngrok](https://ngrok.com/)


# 相关文档

[nginx FAQ](packages/backend/nginx/nginx%20FAQ.md)

