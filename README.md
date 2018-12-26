![Felicity Image](./image/felicity.jpg)
# Felicity plugin

## Pré requisito
- Ter o [mongoose](https://www.npmjs.com/package/mongoose) instalado no `package.json`
- Na `.env` do projeto definir o tipo de driver, a principio o mongoose é o unico driver disponível, o exemplo na `.env` esta no trecho a baixo:
    ```
      ... As demais coisas da .env
      DRIVER_FELICITY=mongo
    ```
- Para conexões de mongo deve conter também na `.env`
    ```
      MONGODB_URI=mongodb://user:password@ip:port/
      MONGODB_NAME=database
    ```

## Instalação

No seu projeto vá no arquivo onde registra os plugins, geralmente fica dentro do arquivo `app.js`, e lá importe a felicity, e pronto, felicity estará disponível na rota `/status`

ex:

```js
const felicity = require('./felicity-status/')

const registraPlugins = () => {
  //  Demais processos
   const registers = [hapiAuthJWT, sqWinston.middlewares.hapi16, sqStatus]

  return server.register(registers)
}

const run = () => {
  return connectDatabase().
  .then(() => registraPlugins(server))
  //  Demais imports
}

run()

```

## Como felicity funciona

Felicity é responsável por tratar como a rota `/status` deve retornar, ela olha para a conexão da aplicação verificando se a mesma esta conectada através da interface do mongoClient, o plugin felicity faz a conexão usando as variaveis `MONGODB_URI` e `MONGODB_NAME` pegando todas as collections do banco e a partir dai faz uma querie geral para todas as coleções verificando se **TODAS** as queries retornam algum resultado, caso de algum erro nesse processo, então gera um erro 500, agora caso dê certo, gera um erro 200
