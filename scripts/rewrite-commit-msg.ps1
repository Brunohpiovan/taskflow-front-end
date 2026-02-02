$msg = [System.Console]::In.ReadToEnd()
$msg = $msg -replace '^chore: add gitignore and project config \(eslint, tsconfig, tailwind, postcss\)', 'chore: adiciona gitignore e config do projeto (eslint, tsconfig, tailwind, postcss)'
$msg = $msg -replace '^chore: add package\.json with dependencies \(Next\.js, React, Zustand, Axios, RHF, dnd-kit, shadcn\)', 'chore: adiciona package.json com dependências (Next.js, React, Zustand, Axios, RHF, dnd-kit, shadcn)'
[System.Console]::Out.Write($msg)
