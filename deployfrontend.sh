rsync -r src/ docs/
rsync build/contracts/* docs/
git add .
git commit -m "adding frontend assets for Github Pages"
git push -u origin master