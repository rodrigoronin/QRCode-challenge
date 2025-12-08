# Caminho inicial (você pode alterar ou deixar "." se rodar dentro de src)
$srcPath = "./src"
$outputFile = "all-scripts.txt"

# Se o arquivo já existir, apaga para gerar limpo
if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

# Pega todos os .ts dentro da pasta e subpastas EXCETO .d.ts
$tsFiles = Get-ChildItem -Path $srcPath -Recurse -Filter "*.ts" | Where-Object { $_.Name -notlike "*.d.ts" }

foreach ($file in $tsFiles) {

    # Nome do arquivo em caps, tipo INPUTMANAGER.ts
    $header = "----------> " + $file.Name.ToUpper()

    # Adiciona o cabeçalho ao output
    Add-Content -Path $outputFile -Value $header

    # Lê o conteúdo do .ts e adiciona ao arquivo resultante
    Get-Content $file.FullName | Add-Content -Path $outputFile

    # Linha vazia pra separar blocos
    Add-Content -Path $outputFile -Value ""
}

Write-Host "Arquivo '$outputFile' gerado com sucesso! 🎉"
