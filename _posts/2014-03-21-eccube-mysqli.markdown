---
layout: post
title: "EC-CUBE で MySQL 改良版拡張モジュールを使用する"
date: 2014-03-21 01:24:22
category: development
tags: [eccube, php]
---

PHP 5.5 のリリースに従い [MySQL 関数](http://www.php.net/manual/ja/book.mysql.php) は非推奨になりました。
EC-CUBE もその MySQL 関数を MDB2 経由で利用しています。改修が必要ですね。
という訳で EC-CUBE を [MySQL 改良版拡張モジュール](http://www.php.net/manual/ja/book.mysqli.php) に対応させる実験を行いました。

結論から述べます。対応できました。作業結果は [こちらの gist](https://gist.github.com/zenith6/9679810) にまとめてあります。
動作は未確認の部分が多いですが、必要な方はご参考までにご利用下しさい。

それでは作業を始めます。まずはプロジェクトの用意です。現時点において最新版である 2.13 系の開発ブランチをチェックアウトします。

``` bash
zenith ~
$ svn checkout https://svn.ec-cube.net/open/branches/version-2_13-dev/ eccube-2.13-mysqli -q

zenith ~
$ cd eccube-2.13-mysqli/

zenith ~/eccube-2.13-mysqli
$ svn info
パス: .
URL: https://svn.ec-cube.net/open/branches/version-2_13-dev
リポジトリのルート: https://svn.ec-cube.net/open
リポジトリ UUID: 1e3b908f-19a9-db11-a64c-001125224ba8
リビジョン: 23352
ノード種別: ディレクトリ
準備中の処理: 特になし
最終変更者: shutta
最終変更リビジョン: 23352
最終変更日時: 2014-03-19 23:12:02 +0900 (水, 19  3月 2014)
```



次に [MDB2_Driver_mysql](http://pear.php.net/package/MDB2_Driver_mysql/) をインストールします。
今回はプロジェクト専用の PEAR を用意してパッケージ管理下で入れました。
今時は composer を使った方がいいでしょう。そちらはまた別の機会に言及してみたいと思います。

``` bash
zenith ~/eccube-2.13-mysqli
$ # プロジェクト専用の PEAR 設定ファイルを作成
$ pear config-create `pwd` pear.conf
Configuration (channel pear.php.net):
=====================================
Auto-discover new Channels     auto_discover    <not set>
Default Channel                default_channel  pear.php.net
HTTP Proxy Server Address      http_proxy       <not set>
PEAR server [DEPRECATED]       master_server    <not set>
Default Channel Mirror         preferred_mirror <not set>
Remote Configuration File      remote_config    <not set>
PEAR executables directory     bin_dir          /home/zenith/eccube-2.13-mysqli/pear
PEAR documentation directory   doc_dir          /home/zenith/eccube-2.13-mysqli/pear/docs
PHP extension directory        ext_dir          /home/zenith/eccube-2.13-mysqli/pear/ext
PEAR directory                 php_dir          /home/zenith/eccube-2.13-mysqli/pear/php
PEAR Installer cache directory cache_dir        /home/zenith/eccube-2.13-mysqli/pear/cache
PEAR configuration file        cfg_dir          /home/zenith/eccube-2.13-mysqli/pear/cfg
directory
PEAR data directory            data_dir         /home/zenith/eccube-2.13-mysqli/pear/data
PEAR Installer download        download_dir     /home/zenith/eccube-2.13-mysqli/pear/download
directory
PHP CLI/CGI binary             php_bin          <not set>
php.ini location               php_ini          <not set>
--program-prefix passed to     php_prefix       <not set>
PHP's ./configure
--program-suffix passed to     php_suffix       <not set>
PHP's ./configure
PEAR Installer temp directory  temp_dir         /home/zenith/eccube-2.13-mysqli/pear/temp
PEAR test directory            test_dir         /home/zenith/eccube-2.13-mysqli/pear/tests
PEAR www files directory       www_dir          /home/zenith/eccube-2.13-mysqli/pear/www
Cache TimeToLive               cache_ttl        <not set>
Preferred Package State        preferred_state  <not set>
Unix file mask                 umask            <not set>
Debug Log Level                verbose          <not set>
PEAR password (for             password         <not set>
maintainers)
Signature Handling Program     sig_bin          <not set>
Signature Key Directory        sig_keydir       <not set>
Signature Key Id               sig_keyid        <not set>
Package Signature Type         sig_type         <not set>
PEAR username (for             username         <not set>
maintainers)
User Configuration File        Filename         /home/zenith/eccube-2.13-mysqli/pear.conf
System Configuration File      Filename         #no#system#config#
Successfully created default configuration file "/home/zenith/eccube-2.13-mysqli/pear.conf"

zenith ~/eccube-2.13-mysqli
$ # パッケージ内の PHP ファイルの保存先を既存の場所に変更
$ pear -c pear.conf config-set php_dir `pwd`/data/module
config-set succeeded

zenith ~/eccube-2.13-mysqli
$ # パッケージが必要とするデータファイルの保存先を変更（省略可）
$ pear -c pear.conf config-set data_dir `pwd`/data/data
config-set succeeded

zenith ~/eccube-2.13-mysqli
$ # 設定を確認
$ pear -c pear.conf config-show | grep dir
PEAR executables directory     bin_dir          /home/zenith/eccube-2.13-mysqli/pear
PEAR documentation directory   doc_dir          /home/zenith/eccube-2.13-mysqli/pear/docs
PHP extension directory        ext_dir          /home/zenith/eccube-2.13-mysqli/pear/ext
PEAR directory                 php_dir          /home/zenith/eccube-2.13-mysqli/data/module
PEAR Installer cache directory cache_dir        /home/zenith/eccube-2.13-mysqli/pear/cache
PEAR configuration file        cfg_dir          /home/zenith/eccube-2.13-mysqli/pear/cfg
directory
PEAR data directory            data_dir         /home/zenith/eccube-2.13-mysqli/data/data
PEAR Installer download        download_dir     /home/zenith/eccube-2.13-mysqli/pear/download
directory
PEAR Installer temp directory  temp_dir         /home/zenith/eccube-2.13-mysqli/pear/temp
PEAR test directory            test_dir         /home/zenith/eccube-2.13-mysqli/pear/tests
PEAR www files directory       www_dir          /home/zenith/eccube-2.13-mysqli/pear/www
Signature Key Directory        sig_keydir       /etc/pearkeys

$ # MDB2 と MDB2_Driver_mysqli をインストール
$ pear -c pear.conf install MDB2 MDB2_Driver_mysqli
WARNING: "pear/Console_Getopt" is deprecated in favor of "pear/Console_GetoptPlus"
downloading MDB2-2.4.1.tgz ...
Starting to download MDB2-2.4.1.tgz (119,790 bytes)
..............done: 119,790 bytes
downloading MDB2_Driver_mysqli-1.4.1.tgz ...
Starting to download MDB2_Driver_mysqli-1.4.1.tgz (38,064 bytes)
...done: 38,064 bytes
downloading PEAR-1.9.4.tgz ...
Starting to download PEAR-1.9.4.tgz (296,332 bytes)
...done: 296,332 bytes
downloading Archive_Tar-1.3.11.tgz ...
Starting to download Archive_Tar-1.3.11.tgz (18,537 bytes)
...done: 18,537 bytes
downloading Structures_Graph-1.0.4.tgz ...
Starting to download Structures_Graph-1.0.4.tgz (30,318 bytes)
...done: 30,318 bytes
downloading Console_Getopt-1.3.1.tgz ...
Starting to download Console_Getopt-1.3.1.tgz (4,471 bytes)
...done: 4,471 bytes
downloading XML_Util-1.2.1.tgz ...
Starting to download XML_Util-1.2.1.tgz (17,729 bytes)
...done: 17,729 bytes
install ok: channel://pear.php.net/Archive_Tar-1.3.11
install ok: channel://pear.php.net/Structures_Graph-1.0.4
install ok: channel://pear.php.net/Console_Getopt-1.3.1
install ok: channel://pear.php.net/XML_Util-1.2.1
install ok: channel://pear.php.net/PEAR-1.9.4
install ok: channel://pear.php.net/MDB2-2.4.1
install ok: channel://pear.php.net/MDB2_Driver_mysqli-1.4.1
PEAR: Optional feature webinstaller available (PEAR's web-based installer)
PEAR: Optional feature gtkinstaller available (PEAR's PHP-GTK-based installer)
PEAR: Optional feature gtk2installer available (PEAR's PHP-GTK2-based installer)
PEAR: To install optional features use "pear install pear/PEAR#featurename"
MDB2: Optional feature fbsql available (Frontbase SQL driver for MDB2)
MDB2: Optional feature ibase available (Interbase/Firebird driver for MDB2)
MDB2: Optional feature mysql available (MySQL driver for MDB2)
MDB2: Optional feature mysqli available (MySQLi driver for MDB2)
MDB2: Optional feature mssql available (MS SQL Server driver for MDB2)
MDB2: Optional feature oci8 available (Oracle driver for MDB2)
MDB2: Optional feature pgsql available (PostgreSQL driver for MDB2)
MDB2: Optional feature querysim available (Querysim driver for MDB2)
MDB2: Optional feature sqlite available (SQLite2 driver for MDB2)
MDB2: To install optional features use "pear install pear/MDB2#featurename"
```

インストールが終わりました。確認します。

``` bash
zenith ~/eccube-2.13-mysqli
$ # 期待通りの場所にインストールされたかな？
$ svn status
?       pear
?       pear.conf
?       data/data
?       data/module/OS
?       data/module/Structures
?       data/module/PEAR
?       data/module/.depdb
?       data/module/peclcmd.php
?       data/module/pearcmd.php
?       data/module/Console
?       data/module/.depdblock
?       data/module/System.php
?       data/module/.registry
?       data/module/.filemap
?       data/module/.lock
?       data/module/.channels
M       data/module/MDB2/Iterator.php
M       data/module/MDB2/LOB.php
M       data/module/MDB2/Date.php
M       data/module/MDB2/Extended.php
?       data/module/MDB2/Driver/mysqli.php
?       data/module/MDB2/Driver/Function/mysqli.php
M       data/module/MDB2/Driver/Function/Common.php
?       data/module/MDB2/Driver/Native/mysqli.php
M       data/module/MDB2/Driver/Native/Common.php
?       data/module/MDB2/Driver/Manager/mysqli.php
M       data/module/MDB2/Driver/Manager/Common.php
?       data/module/MDB2/Driver/Datatype/mysqli.php
M       data/module/MDB2/Driver/Datatype/Common.php
?       data/module/MDB2/Driver/Reverse/mysqli.php
M       data/module/MDB2/Driver/Reverse/Common.php
M       data/module/PEAR5.php
M       data/module/MDB2.php
M       data/module/PEAR.php

zenith ~/eccube-2.13-mysqli
$ # バージョンも確認
$ pear -c pear.conf list
Installed packages, channel pear.php.net:
=========================================
Package            Version State
Archive_Tar        1.3.11  stable
Console_Getopt     1.3.1   stable
MDB2               2.4.1   stable
MDB2_Driver_mysqli 1.4.1   stable
PEAR               1.9.4   stable
Structures_Graph   1.0.4   stable
XML_Util           1.2.1   stable
```

インストールできています。要らない物も入ってますね。気にしない気にしない。

あや、しまった！元から入っている最新の MDB2 を古いバージョンで上書きしてしまった…
PEAR のドキュメントを読むと、ベータ版を入れる時には -beta サフィックスをつけろと書いてあります。
言われる通り -beta をくっ付けてアップグレードで入れ直します。

``` bash
zenith ~/eccube-2.13-mysqli
$ pear -c pear.conf upgrade MDB2-beta MDB2_Driver_mysqli-beta
downloading MDB2-2.5.0b5.tgz ...
Starting to download MDB2-2.5.0b5.tgz (136,834 bytes)
.............................done: 136,834 bytes
downloading MDB2_Driver_mysqli-1.5.0b4.tgz ...
Starting to download MDB2_Driver_mysqli-1.5.0b4.tgz (49,450 bytes)
...done: 49,450 bytes
upgrade ok: channel://pear.php.net/MDB2-2.5.0b5
upgrade ok: channel://pear.php.net/MDB2_Driver_mysqli-1.5.0b4
MDB2: Optional feature fbsql available (Frontbase SQL driver for MDB2)
MDB2: Optional feature ibase available (Interbase/Firebird driver for MDB2)
MDB2: Optional feature mssql available (MS SQL Server driver for MDB2)
MDB2: Optional feature mysql available (MySQL driver for MDB2)
MDB2: Optional feature mysqli available (MySQLi driver for MDB2)
MDB2: Optional feature oci8 available (Oracle driver for MDB2)
MDB2: Optional feature odbc available (ODBC driver for MDB2)
MDB2: Optional feature pgsql available (PostgreSQL driver for MDB2)
MDB2: Optional feature querysim available (Querysim driver for MDB2)
MDB2: Optional feature sqlite available (SQLite2 driver for MDB2)
MDB2: Optional feature sqlsrv available (MS SQL Server driver for MDB2)
MDB2: To install optional features use "pear install pear/MDB2#featurename"

zenith ~/eccube-2.13-mysqli
$ svn status
?       pear
?       pear.conf
?       data/data
?       data/module/OS
?       data/module/Structures
?       data/module/PEAR
?       data/module/.depdb
?       data/module/peclcmd.php
?       data/module/pearcmd.php
?       data/module/Console
?       data/module/.depdblock
?       data/module/System.php
?       data/module/.registry
?       data/module/.filemap
?       data/module/.lock
?       data/module/.channels
?       data/module/MDB2/Driver/mysqli.php
?       data/module/MDB2/Driver/Function/mysqli.php
?       data/module/MDB2/Driver/Native/mysqli.php
?       data/module/MDB2/Driver/Manager/mysqli.php
?       data/module/MDB2/Driver/Datatype/mysqli.php
?       data/module/MDB2/Driver/Reverse/mysqli.php
M       data/module/PEAR5.php
M       data/module/PEAR.php

zenith ~/eccube-2.13-mysqli
$ pear -c pear.conf list
Installed packages, channel pear.php.net:
=========================================
Package            Version State
Archive_Tar        1.3.11  stable
Console_Getopt     1.3.1   stable
MDB2               2.5.0b5 beta
MDB2_Driver_mysqli 1.5.0b4 beta
PEAR               1.9.4   stable
Structures_Graph   1.0.4   stable
XML_Util           1.2.1   stable
```

これで良し。下ごしらえは完了です。

さぁここからが本番です。MDB2_Driver_mysql に依存している個所を調べます。

``` bash
zenith ~/eccube-2.13-mysqli
$ find . -regex '^./\(data/module\|pear.*\|data/data\)' -prune -o -name '.svn' -prune -o -print0 | xargs -0 grep MDB2_Driver_mysql
```

なさそうですね。次は mysql で検索します。

``` bash
$ find . -regex '^./\(data/module\|pear.*\|data/data\)' -prune -o -name '.svn' -prune -o -print0 | xargs -0 grep mysql -n
./.travis.yml:11:  - DB=mysql USER=root DBNAME=myapp_test DBPASS=' ' DBUSER=root
./.travis.yml:17:  - sh -c "if [ '$DB' = 'mysql' ]; then mysql -e 'CREATE DATABASE myapp_test;'; fi"
./.travis.yml:18:  - sh -c "if [ '$DB' = 'mysql' ]; then sh ./eccube_install.sh mysql; fi"
./test/class/db/SC_DB_DBFactory_Test.php:51:            case 'mysql':
./test/class/db/SC_DB_DBFactory_Test.php:77:        case 'mysql':
./test/class/db/SC_DB_DBFactory_Test.php:104:        case 'mysql':
./test/class/db/SC_DB_DBFactory_Test.php:134:        case 'mysql':
./test/class/db/SC_DB_DBFactory_Test.php:167:        case 'mysql':
./tests/class/helper/SC_Helper_TaxRule/SC_Helper_TaxRule_setTaxRuleTest.php:27:        // postgresとmysqlでmember_idのカラムに差がある
./data/class_extends/db_extends/SC_DB_DBFactory_Ex.php:46:            case 'mysql':
./data/class/db/SC_DB_DBFactory.php:42:            case 'mysql':
./html/install/templates/step2.tpl:30:    if (type == 'mysql') {
./html/install/templates/step2.tpl:31:        form1.db_port.value = '<!--{$arrDB_PORT.mysql}-->';
./html/install/index.php:49:    'mysql' => 'MySQL',
./html/install/index.php:53:    'mysql' => '',
./html/install/index.php:851:            if ($arrDsn['phptype'] === 'mysql') {
./eccube_install.sh:19:# # ./ec_cube_install.sh mysql
./eccube_install.sh:56:"mysql" )
./eccube_install.sh:58:    MYSQL=mysql
./eccube_install.sh:157:"mysql" )
./eccube_install.sh:171:    ${MYSQL} -u ${DBUSER} ${PASSOPT} ${DBNAME} < ${SQL_DIR}/create_table_mysql.sql
```

ぞろぞろ出てきました。test はとりあえず無視、travis.xml も無視、*.tpl も無視、eccube_install.sh はコマンドラインでインストールするためのものなのでこれも無視。と除外していくと次の3つが残りました。

* ./data/class_extends/db_extends/SC_DB_DBFactory_Ex.php
* ./data/class/db/SC_DB_DBFactory.php
* ./html/install/index.php

SC_DB_DBFactory の中身は DBMS に依存する処理を行っていました。MDB2 とは関係がないものなので無視します。
SC_DB_DBFactory_Ex が引っかかっているのは実装の削除し忘れでしょうか。こちらは不具合報告行きです。
結果 ./html/install/index.php に絞れました。index.php 内を MDB2 で更に grep します。

``` bash
$ grep MDB2 html/install/index.php -n5
808-
809-    if (count($objErr->arrErr) == 0) {
810-        $arrDsn = getArrayDsn($objDBParam);
811-        // Debugモード指定
812-        $options['debug'] = PEAR_DB_DEBUG;
813:        $objDB = MDB2::connect($arrDsn, $options);
814-        // 接続成功
815-        if (!PEAR::isError($objDB)) {
816-            $dbFactory = SC_DB_DBFactory_Ex::getInstance($arrDsn['phptype']);
817-            // データベースバージョン情報の取得
818-            $objPage->tpl_db_version = $dbFactory->sfGetDBVersion($arrDsn);
--
839-            $sql = fread($fp, filesize($filepath));
840-            fclose($fp);
841-        }
842-        // Debugモード指定
843-        $options['debug'] = PEAR_DB_DEBUG;
844:        $objDB = MDB2::connect($arrDsn, $options);
845-        // 接続エラー
846-        if (!PEAR::isError($objDB)) {
847-            $objDB->setCharset('utf8');
848-
849-            // MySQL 用の初期化
--
890-{
891-    $arrErr = array();
892-
893-    // Debugモード指定
894-    $options['debug'] = PEAR_DB_DEBUG;
895:    $objDB = MDB2::connect($arrDsn, $options);
896-    $objManager =& $objDB->loadModule('Manager');
897-
898-    // 接続エラー
899-    if (!PEAR::isError($objDB)) {
900-        $exists = $objManager->listSequences();
--
929-{
930-    $arrErr = array();
931-
932-    // Debugモード指定
933-    $options['debug'] = PEAR_DB_DEBUG;
934:    $objDB = MDB2::connect($arrDsn, $options);
935-    $objManager =& $objDB->loadModule('Manager');
936-
937-    // 接続エラー
938-    if (!PEAR::isError($objDB)) {
939-        $exists = $objManager->listSequences();
```

MDB2::connect() が出てきました。MDB2 が使用するドライバーはこのメソッドに渡す DSN で決まります。mysqli を選択できるようにちょっと改造します。

``` diff
Index: html/install/index.php
===================================================================
--- html/install/index.php	(revision 23352)
+++ html/install/index.php	(working copy)
@@ -45,12 +45,14 @@

 $objPage = new StdClass;
 $objPage->arrDB_TYPE = array(
-    'pgsql' => 'PostgreSQL',
-    'mysql' => 'MySQL',
+    'pgsql'  => 'PostgreSQL',
+    'mysql'  => 'MySQL (use mysql)',
+    'mysqli' => 'MySQL (use mysqli)',
 );
 $objPage->arrDB_PORT = array(
-    'pgsql' => '',
-    'mysql' => '',
+    'pgsql'  => '',
+    'mysql'  => '',
+    'mysqli' => '',
 );
 $objPage->arrMailBackend = array('mail' => 'mail',
                                  'smtp' => 'SMTP',
@@ -848,9 +850,12 @@

             // MySQL 用の初期化
             // XXX SC_Query を使うようにすれば、この処理は不要となる
-            if ($arrDsn['phptype'] === 'mysql') {
-                $objDB->exec('SET SESSION storage_engine = InnoDB');
-                $objDB->exec("SET SESSION sql_mode = 'ANSI'");
+            switch ($arrDsn['phptype']) {
+                case 'mysql':
+                case 'mysqli':
+                    $objDB->exec('SET SESSION storage_engine = InnoDB');
+                    $objDB->exec("SET SESSION sql_mode = 'ANSI'");
+                    break;
             }

             $sql_split = split(';', $sql);
Index: html/install/templates/step2.tpl
===================================================================
--- html/install/templates/step2.tpl	(revision 23352)
+++ html/install/templates/step2.tpl	(working copy)
@@ -20,16 +20,16 @@
  * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
  *}-->
 <script type="text/javascript">
+var ports = {
+    <!--{foreach from=$arrDB_PORT key=type item=port name=ports}-->
+        '<!--{$type|escape:'javascript'}-->' :
+            '<!--{$port|escape:'javascript'}-->'
+            <!--{if !$smarty.foreach.ports.last}-->,<!--{/if}-->
+    <!--{/foreach}-->
+};
+
 function lfnChangePort(db_type) {
-    type = db_type.value;
-
-    if (type == 'pgsql') {
-        form1.db_port.value = '<!--{$arrDB_PORT.pgsql}-->';
-    }
-
-    if (type == 'mysql') {
-        form1.db_port.value = '<!--{$arrDB_PORT.mysql}-->';
-    }
+    form1.db_port.value = ports[db_type.value];
 }
 </script>
 <form name="form1" id="form1" method="post" action="?">
```

ではインストールを試します。

```
データベースの設定
※インストールの前に新しくDBを作成しておく必要があります。
>> MDB2 Error: connect failed
[Error message: unable to establish a connection]
```

接続できないと怒られました。原因を調べます。

```
Warning: mysqli_real_connect() expects parameter 6 to be long, string given in /home/zenith/eccube-2.13-mysqli/data/module/MDB2/Driver/mysqli.php on line 553
```

ポート番号に空文字列を渡しているのが原因でした。MDB2 のマニュアル通りに、省略する場合は false を渡すよう修正します。

``` diff
Index: html/install/index.php
===================================================================
--- html/install/index.php	(revision 23352)
+++ html/install/index.php	(working copy)
@@ -45,12 +45,14 @@

 $objPage = new StdClass;
 $objPage->arrDB_TYPE = array(
-    'pgsql' => 'PostgreSQL',
-    'mysql' => 'MySQL',
+    'pgsql'  => 'PostgreSQL',
+    'mysql'  => 'MySQL (use mysql)',
+    'mysqli' => 'MySQL (use mysqli)',
 );
 $objPage->arrDB_PORT = array(
-    'pgsql' => '',
-    'mysql' => '',
+    'pgsql'  => '',
+    'mysql'  => '',
+    'mysqli' => '',
 );
 $objPage->arrMailBackend = array('mail' => 'mail',
                                  'smtp' => 'SMTP',
@@ -848,9 +850,12 @@

             // MySQL 用の初期化
             // XXX SC_Query を使うようにすれば、この処理は不要となる
-            if ($arrDsn['phptype'] === 'mysql') {
-                $objDB->exec('SET SESSION storage_engine = InnoDB');
-                $objDB->exec("SET SESSION sql_mode = 'ANSI'");
+            switch ($arrDsn['phptype']) {
+                case 'mysql':
+                case 'mysqli':
+                    $objDB->exec('SET SESSION storage_engine = InnoDB');
+                    $objDB->exec("SET SESSION sql_mode = 'ANSI'");
+                    break;
             }

             $sql_split = split(';', $sql);
@@ -1021,6 +1026,10 @@
         define('AUTH_MAGIC', $auth_magic);
     }

+    // DB 接続情報
+    $db_port = $objDBParam->getValue('db_port');
+    $db_port = $db_port == '' ? false : $db_port;
+
     // FIXME 変数出力はエスケープすべき
     $config_data = "<?php\n"
                  . "define('ECCUBE_INSTALL', 'ON');\n"
@@ -1033,7 +1042,7 @@
                  . "define('DB_PASSWORD', '"           . $objDBParam->getValue('db_password') . "');\n"
                  . "define('DB_SERVER', '"             . $objDBParam->getValue('db_server') . "');\n"
                  . "define('DB_NAME', '"               . $objDBParam->getValue('db_name') . "');\n"
-                 . "define('DB_PORT', '"               . $objDBParam->getValue('db_port') . "');\n"
+                 . "define('DB_PORT', "                . var_export($db_port, true) . ");\n"
                  . "define('ADMIN_DIR', '"             . $objWebParam->getValue('admin_dir') . "/');\n"
                  . "define('ADMIN_FORCE_SSL', "        . $force_ssl . ");\n"
                  . "define('ADMIN_ALLOW_HOSTS', '"     . serialize($allow_hosts) . "');\n"
@@ -1160,7 +1169,7 @@
         'username'  => $arrRet['db_user'],
         'password'  => $arrRet['db_password'],
         'database'  => $arrRet['db_name'],
-        'port'      => $arrRet['db_port'],
+        'port'      => $arrRet['db_port'] != '' ? $arrRet['db_port'] : false,
     );

     // 文字列形式の DSN との互換処理
Index: html/install/templates/step2.tpl
===================================================================
--- html/install/templates/step2.tpl	(revision 23352)
+++ html/install/templates/step2.tpl	(working copy)
@@ -20,16 +20,16 @@
  * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
  *}-->
 <script type="text/javascript">
+var ports = {
+    <!--{foreach from=$arrDB_PORT key=type item=port name=ports}-->
+        '<!--{$type|escape:'javascript'}-->' :
+            '<!--{$port|escape:'javascript'}-->'
+            <!--{if !$smarty.foreach.ports.last}-->,<!--{/if}-->
+    <!--{/foreach}-->
+};
+
 function lfnChangePort(db_type) {
-    type = db_type.value;
-
-    if (type == 'pgsql') {
-        form1.db_port.value = '<!--{$arrDB_PORT.pgsql}-->';
-    }
-
-    if (type == 'mysql') {
-        form1.db_port.value = '<!--{$arrDB_PORT.mysql}-->';
-    }
+    form1.db_port.value = ports[db_type.value];
 }
 </script>
 <form name="form1" id="form1" method="post" action="?">
```

これで接続が成功するようになりました。続けてデータベースの初期化に移ります。

```
データベースの初期化を開始します。
※すでにテーブル等が作成されている場合は中断されます。
データベースの初期化処理を行わない
×：テーブルの作成に失敗しました。

>> スクリプトファイルが見つかりません
```

またまた怒られました。テーブル作成用の DDL を収めた SQL ファイルがドライバー毎に用意されているためです。コピペで済ませます。

``` bash
zenith ~/eccube-2.13-mysqli
$ cp html/install/sql/create_table_mysql.sql html/install/sql/create_table_mysqli.sql
```

インストールを再開します。

```
データベースの初期化

データベースの初期化を開始します。
※すでにテーブル等が作成されている場合は中断されます。
データベースの初期化処理を行わない
○：テーブルの作成に成功しました。
○：初期データの作成に成功しました。
○：シーケンスの作成に成功しました。
```

インストールが完了しました！フロントに接続してみます。

```
Fatal error: DB処理でエラーが発生しました。 SQL: [] MDB2 Error: syntax error _doQuery: [Error message: Could not execute statement] [Last executed query: PREPARE mdb2_statement_mysqli_1f9c3535bba003a1b118eeae4b64dc724a00abd86 FROM NULL] [Native code: 1064] [Native message: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'NULL' at line 1] in /home/zenith/eccube-2.13-mysqli/data/class/SC_Query.php on line 1087
```

アカン。エラーを読む限り SQL 文がどこかで NULL になってしまっていますね。デバッガーで追いかけます。

``` php
<?php
//省略

class SC_DB_DBFactory
{
    /**
     * DB_TYPE に応じた DBFactory インスタンスを生成する.
     *
     * @param  string $db_type 任意のインスタンスを返したい場合は DB_TYPE 文字列を指定
     * @return mixed  DBFactory インスタンス
     */
    public function getInstance($db_type = DB_TYPE)
    {
        switch ($db_type) {
            case 'mysql':
                return new SC_DB_DBFactory_MYSQL();

            case 'pgsql':
                return new SC_DB_DBFactory_PGSQL();

            default:
                return new SC_DB_DBFactory();
        }
    }

```

SC_DB_DBFactory::getInstance($db_type) で mysqli 用のインスタンスが取得できないためでした。実装がないなら無いでエラーを返して欲しいなーｗ
SC_DB_DBFactory_MYSQL を流用するよう修正します。手抜き。

``` diff
Index: data/class/db/SC_DB_DBFactory.php
===================================================================
--- data/class/db/SC_DB_DBFactory.php	(revision 23352)
+++ data/class/db/SC_DB_DBFactory.php	(working copy)
@@ -40,6 +40,7 @@
     {
         switch ($db_type) {
             case 'mysql':
+            case 'mysqli':
                 return new SC_DB_DBFactory_MYSQL();

             case 'pgsql':
```

これでフロントが表示されるようになりました！ユニットテストも確認します。

``` bash
zenith ~/eccube-2.13-mysqli
$ cp tests/phpunit.xml.base tests/phpunit.xml

zenith ~/eccube-2.13-mysqli
$ cp tests/require.php.base tests/require.php

zenith ~/eccube-2.13-mysqli
$ phpunit tests
PHP Fatal error:  DB処理でエラーが発生しました。
SQL: [SELECT CASE WHEN EXISTS(SELECT * FROM dtb_session WHERE sess_id = ?   ) THEN 1 ELSE 0 END]
MDB2 Error: unknown error
_doQuery: [Error message: Could not execute statement]
[Last executed query: PREPARE mdb2_statement_mysqli_6b97867af9fe3af5ca00a06587e3a8c1b9bc12db0 FROM '']
[Native code: 1065]
[Native message: Query was empty]
 in /home/zenith/eccube-2.13-mysqli/data/class/SC_Query.php on line 1087
PHP Stack trace:
PHP   1. {main}() /usr/bin/phpunit:0
PHP   2. PHPUnit_TextUI_Command::main() /usr/bin/phpunit:46
PHP   3. PHPUnit_TextUI_Command->run() /usr/share/pear/PHPUnit/TextUI/Command.php:129
PHP   4. PHPUnit_TextUI_TestRunner->doRun() /usr/share/pear/PHPUnit/TextUI/Command.php:176
PHP   5. PHPUnit_Framework_TestSuite->run() /usr/share/pear/PHPUnit/TextUI/TestRunner.php:349
PHP   6. PHPUnit_Framework_TestSuite->run() /usr/share/pear/PHPUnit/Framework/TestSuite.php:705
PHP   7. PHPUnit_Framework_TestSuite->runTest() /usr/share/pear/PHPUnit/Framework/TestSuite.php:745
PHP   8. PHPUnit_Framework_TestCase->run() /usr/share/pear/PHPUnit/Framework/TestSuite.php:775
PHP   9. PHPUnit_Framework_TestResult->run() /usr/share/pear/PHPUnit/Framework/TestCase.php:783
PHP  10. PHPUnit_Framework_TestCase->runBare() /usr/share/pear/PHPUnit/Framework/TestResult.php:648
PHP  11. SC_CheckError_HTML_TAG_CHECKTest->setUp() /usr/share/pear/PHPUnit/Framework/TestCase.php:835
PHP  12. SC_DB_MasterData->getMasterData() /home/zenith/eccube-2.13-mysqli/tests/class/SC_CheckError/SC_CheckError_HTML_TAG_CHECKTest.php:34
PHP  13. SC_DB_MasterData->createCache() /home/zenith/eccube-2.13-mysqli/data/class/db/SC_DB_MasterData.php:75
PHP  14. SC_DB_MasterData->getDbMasterData() /home/zenith/eccube-2.13-mysqli/data/class/db/SC_DB_MasterData.php:258
PHP  15. SC_Query->select() /home/zenith/eccube-2.13-mysqli/data/class/db/SC_DB_MasterData.php:316
PHP  16. SC_Query->getAll() /home/zenith/eccube-2.13-mysqli/data/class/SC_Query.php:176
PHP  17. SC_Query->prepare() /home/zenith/eccube-2.13-mysqli/data/class/SC_Query.php:296
PHP  18. SC_Query->error() /home/zenith/eccube-2.13-mysqli/data/class/SC_Query.php:1016
PHP  19. trigger_error() /home/zenith/eccube-2.13-mysqli/data/class/SC_Query.php:1087
PHP  20. SC_Helper_HandleError::handle_warning() /home/zenith/eccube-2.13-mysqli/data/class/SC_Query.php:1087
PHP  21. SC_Helper_Session->sfSessWrite() /home/zenith/eccube-2.13-mysqli/data/class/SC_Query.php:0
PHP  22. SC_Query->exists() /home/zenith/eccube-2.13-mysqli/data/class/helper/SC_Helper_Session.php:88
PHP  23. SC_Query->getOne() /home/zenith/eccube-2.13-mysqli/data/class/SC_Query.php:157
PHP  24. SC_Query->prepare() /home/zenith/eccube-2.13-mysqli/data/class/SC_Query.php:691
PHP  25. SC_Query->error() /home/zenith/eccube-2.13-mysqli/data/class/SC_Query.php:1016
PHP  26. trigger_error() /home/zenith/eccube-2.13-mysqli/data/class/SC_Query.php:1087
```

ウェブサーバー経由の操作で実行された時には問題が出ていない API で E_FATAL が発生しています。
原因を突き止める前に、PHPUnit の結果が実行環境に依存して失敗する現象を思い出しました。
これは PHPUnit によって、グローバル変数に保存されている MDB2 のリソースが破壊され接続が切断されてしまうというものです。
暗黙的な切断と再接続により、`new SC_Query()` 時に発行される初期化クエリーが無かった事になるため、文字化けやら SQL 文の解釈が失敗する可能性がある問題でした。
初期化クエリーを発行しているのは MySQL だけなのですが PostgreSQL も無縁な問題ではありません。
ちなみにフォーラムに報告した時はあまり反応がなくお流れになりました;v;
その時に作ったパッチを当てます。

``` diff
Index: tests/class/Common_TestCase.php
===================================================================
--- tests/class/Common_TestCase.php	(revision 23352)
+++ tests/class/Common_TestCase.php	(working copy)
@@ -17,6 +17,17 @@
  */
 class Common_TestCase extends PHPUnit_Framework_TestCase
 {
+    /**
+     * MDB2 をグローバル変数のバックアップ対象から除外する。
+     *
+     * @var array
+     * @see PHPUnit_Framework_TestCase::$backupGlobals
+     * @see PHPUnit_Framework_TestCase::$backupGlobalsBlacklist
+     */
+    protected $backupGlobalsBlacklist = array(
+        '_MDB2_databases',
+        '_MDB2_dsninfo_default',
+    );

   /** SC_Query インスタンス */
   protected $objQuery;
```

再度テスト。

``` bash
zenith ~/eccube-2.13-mysqli
$ phpunit tests


PHPUnit 3.7.29 by Sebastian Bergmann.

...............................................................  63 / 605 ( 10%)
............................................................... 126 / 605 ( 20%)
.............................................F.F............... 189 / 605 ( 31%)
.....................FFFFFFF................................... 252 / 605 ( 41%)
............................................................... 315 / 605 ( 52%)
............................................................... 378 / 605 ( 62%)
............................................................... 441 / 605 ( 72%)
...............FFF...........................................Hello, World!!
.Hello, World!!Hello. 504 / 605 ( 83%)
...........................................................F... 567 / 605 ( 93%)
......................................

Time: 27.81 seconds, Memory: 106.50Mb

There were 13 failures:

1) SC_SmartphoneUserAgent_isSmartphoneTest::windowsPhone with data set #0 ('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; KDDI-TS01; Windows Phone 6.5.3.5)')
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/SC_SmartphoneUserAgent/SC_SmartphoneUserAgent_isSmartphoneTest.php:119

2) SC_SmartphoneUserAgent_isSmartphoneTest::windowsPhone with data set #2 ('Mozilla/4.0 (compatible; MSIE 6.0; Windows CE; IEMobile 8.12; MSIEMobile 6.0) WS027SH')
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/SC_SmartphoneUserAgent/SC_SmartphoneUserAgent_isSmartphoneTest.php:119

3) SC_SmartphoneUserAgent_isSmartphoneTest::BlackBerry with data set #0 ('BlackBerry9000/4.6.0.294 Profile/MIDP-2.0 Configuration/CLDC-1.1 VendorID/220')
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/SC_SmartphoneUserAgent/SC_SmartphoneUserAgent_isSmartphoneTest.php:197

4) SC_SmartphoneUserAgent_isSmartphoneTest::BlackBerry with data set #1 ('BlackBerry9300/5.0.0.1007 Profile/MIDP-2.1 Configuration/CLDC-1.1 VendorID/220')
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/SC_SmartphoneUserAgent/SC_SmartphoneUserAgent_isSmartphoneTest.php:197

5) SC_SmartphoneUserAgent_isSmartphoneTest::BlackBerry with data set #2 ('BlackBerry9700/5.0.0.1014 Profile/MIDP-2.1 Configuration/CLDC-1.1 VendorID/220')
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/SC_SmartphoneUserAgent/SC_SmartphoneUserAgent_isSmartphoneTest.php:197

6) SC_SmartphoneUserAgent_isSmartphoneTest::BlackBerry with data set #3 ('Mozilla/5.0 (BlackBerry; U; BlackBerry 9700; ja) AppleWebKit/534.8+ (KHTML, like Gecko) Version/6.0.0.570 Mobile Safari/534.8+')
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/SC_SmartphoneUserAgent/SC_SmartphoneUserAgent_isSmartphoneTest.php:197

7) SC_SmartphoneUserAgent_isSmartphoneTest::BlackBerry with data set #4 ('Mozilla/5.0 (BlackBerry; U; BlackBerry 9780; ja) AppleWebKit/534.8+ (KHTML, like Gecko) Version/6.0.0.587 Mobile Safari/534.8+')
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/SC_SmartphoneUserAgent/SC_SmartphoneUserAgent_isSmartphoneTest.php:197

8) SC_SmartphoneUserAgent_isSmartphoneTest::BlackBerry with data set #5 ('Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; ja) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.74 Mobile Safari/534.11+')
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/SC_SmartphoneUserAgent/SC_SmartphoneUserAgent_isSmartphoneTest.php:197

9) SC_SmartphoneUserAgent_isSmartphoneTest::BlackBerry with data set #6 ('Opera/9.80 (BlackBerry; Opera Mini/6.1.25376/26.958; U; en) Presto/2.8.119 Version/10.54')
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/SC_SmartphoneUserAgent/SC_SmartphoneUserAgent_isSmartphoneTest.php:197

10) SC_Utils_sfIsInternalDomainTest::testsfIsInternalDomain_ドメインが一致する場合_trueが返る
http://test.local/html/index.php
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/Common_TestCase.php:58
/home/zenith/eccube-2.13-mysqli/tests/class/util/SC_Utils/SC_Utils_isInternalDomainTest.php:55

11) SC_Utils_sfIsInternalDomainTest::testsfIsInternalDomain_アンカーを含むURLの場合_trueが返る
http://test.local/html/index.php#hoge
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/Common_TestCase.php:58
/home/zenith/eccube-2.13-mysqli/tests/class/util/SC_Utils/SC_Utils_isInternalDomainTest.php:64

12) SC_Utils_sfIsInternalDomainTest::testsfIsInternalDomain_ドメインが一致しない場合_falseが返る
http://test.local.jp/html/index.php
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/Common_TestCase.php:58
/home/zenith/eccube-2.13-mysqli/tests/class/util/SC_Utils/SC_Utils_isInternalDomainTest.php:73

13) SC_Utils_sfIsSuccessTest::testSfIsSuccess_認証成功でリファラが正しい場合_trueが返る
認証可否
Failed asserting that false matches expected true.

/home/zenith/eccube-2.13-mysqli/tests/class/Common_TestCase.php:58
/home/zenith/eccube-2.13-mysqli/tests/class/util/SC_Utils/SC_Utils_sfIsSucceessTest.php:81

FAILURES!
Tests: 605, Assertions: 630, Failures: 13.
```

これで最後まで通るようになりました。
ポロポロ出ているエラーは MDB2 とは無関係の問題ですので今回は対応しません。

思ったより簡単に追加出来ましたね。
後はテストでカバーされていない部分を確認したら本番にも使えるんじゃないかなと思います。
というよりテストされているのは一部分だけというのが実情ですので、
ぜひみなさんでテストケースを増やしてあげて下さい！
