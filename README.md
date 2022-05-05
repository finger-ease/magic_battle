# magic_battle

## コマンド一覧

以下のコマンドはリポジトリのルートディレクトリで実行してください。

```sh
# 環境構築, コンテナ起動（初回実行）
make init

# コンテナ起動
make up

# コンテナ停止
make down

# コンテナ再起動
make restart

# すべてのコンテナのログを確認
make logs

# すべてのコンテナのログをウォッチ
make logs-watch

# PlantUMLコンテナのログを確認
make log-plantuml

# PlantUMLコンテナのログをウォッチ
make log-plantuml-watch

# appコンテナのログを確認
make log-app

# appコンテナのログをウォッチ
make log-app-watch

# PlantUMLコンテナのシェルに接続
make plantuml

# appコンテナのシェルに接続
make app

# appコンテナでテストを実行
make test
```

## サービス一覧

|サービス|URL|
|:---|:---|
|PlantUML|<http://localhost:8080/>|
|magic battle|<http://localhost:3000>|
