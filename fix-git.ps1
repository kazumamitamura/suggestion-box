# node_modules を履歴から削除してプッシュするスクリプト
Set-Location $PSScriptRoot

Write-Host "1. 直前のコミットを取り消し（ファイルは残す）..."
git reset --soft HEAD~1

Write-Host "2. node_modules と .next をインデックスから削除..."
git rm -r --cached node_modules 2>$null
git rm -r --cached .next 2>$null

Write-Host "3. 再度追加（.gitignore が適用される）..."
git add .

Write-Host "4. コミット..."
git commit -m "目安箱アプリ"

Write-Host "5. プッシュ..."
git push -u origin main

Write-Host "完了しました。"
