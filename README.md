# Beauty Tech

<p align="center">
  <img src="./assets/logo.png" alt="Beauty Tech Logo" width="200"/>
</p>

## 📋 Sobre o Projeto

Beauty Tech é uma plataforma desenvolvida para o setor de beleza, visando facilitar a gestão de salões e a experiência dos clientes.

## 🚀 Como Executar

### Pré-requisitos
- Node.js instalado
- NPM ou Yarn

### Frontend
```bash
#  Instalar dependências e iniciar
npm install && npm start

#Comando para rodar o backend
node api/server.js
```

### Backend
```bash
# Iniciar o servidor
node api/server.js
```

## 🛠️ Tecnologias Utilizadas

- Frontend: HTML e CSS com Javascript
- Backend: Node.js
- Database: MongoDB (Cloud)
- CI/CD: GitHub Actions
- Deploy: Vercel
- Acessibilidade: WCAG 2.1 AA

## ⚙️ Integração Contínua

O projeto utiliza GitHub Actions para:
- Execução automática de testes
- Verificação de qualidade do código (ESLint)
- Build e deploy automático
- Validação em múltiplas versões do Node.js (16.x e 18.x)

### Executar verificações localmente
```bash
# Instalar dependências de desenvolvimento
npm install

# Executar testes
npm test

# Verificar qualidade do código
npm run lint

# Executar todas as verificações do CI
npm run ci
```

## 🌐 Deploy

O projeto está disponível em produção através da Vercel:
- Frontend: https://beauty-tech.vercel.app
- API: https://beauty-tech.vercel.app/api

### Deploy Manual
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login na Vercel
vercel login

# Deploy
vercel
```

## ♿ Acessibilidade

O projeto segue as diretrizes WCAG 2.1 nível AA, incluindo:
- Alto contraste
- Suporte a navegação por teclado
- Textos alternativos em imagens
- Labels em formulários
- Landmarks ARIA
- Skip links
- Redução de movimento

## 👥 Equipe

- Adaumir Abrão Dos Santos 
- Aline Camila Falcão 
- Claudia Renata Rodrigues Corazzim 
- Cristiano Cabrero Cezar 
- Fatima Aparecida Tagliaferro Spitti 
- Gabriel Marcilio Serpa 
- Josuelen Araujo Dos Santos 
- Juan Carlos Teixeira Jimenez

## 📝 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

Copyright (c) 2024 Beauty Tech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.