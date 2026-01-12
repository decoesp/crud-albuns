Olá!
Bem-vindo(a) ao processo de seleção da Dr. TIS.
A Dr. TIS é uma empresa 100% nacional que nasceu para trazer ao mercado produtos criados
com as melhores práticas para computação em nuvem, com preços competitivos e implantação
simplificada. Atualmente a empresa conta com dois principais produtos: Dr. Nuvem PACS e Dr.
Nuvem Telemedicina.
Agradecemos seu interesse em participar do nosso time. Para isso, desenvolvemos este teste
que irá mostrar para você como trabalhamos no dia-a-dia. Também será uma oportunidade para
conhecermos um pouco com suas habilidades e tomada de decisões no projeto.
Durante o desenvolvimento, aconselhamos que você publique seus avanços em um repositório
no Github. Importante salientar que você não poderá citar no nome do repositório ou em
sua descrição que este é um teste da Dr. TIS. Fique à vontade para escolher um nome e um
tema para seu projeto.
Boa sorte :)
TESTE
React.js + Node.js + Cloud
Projeto de seleção #1
O projeto a ser desenvolvido é um aplicativo web, responsivo, com front-end desenvolvido em
React.js e com backend (APIs) usando Node.js. Deverá ser utilizado um banco SQL ou no-SQL à
sua escolha.
O aplicativo deverá possuir uma maneira do usuário realizar um cadastro com e-mail e uma
senha.
Com o usuário autenticado, ele entrará em uma galeria de álbum de fotos onde cada álbum
possui um título e uma descrição. Na primeira tela, ele pode acessar um álbum para visualizar
as fotos ou criar um novo álbum.
Ao visualizar o álbum, ele terá a opção de exibir as fotos no formato de tabela ou miniaturas.
Ele poderá enviar novas fotos ou apagar alguma existente se desejar. Também é possível
editar o título e descrição do álbum. Só é possível excluir um álbum caso ainda não tenha
nenhuma foto registrada nele.
Todas as fotos possuem os seguintes atributos:
● Título (string)
● Descrição (string)
● Data de aquisição (datetime)
● Tamanho em bytes, kilobytes ou megabytes (number)
● Cor predominante (string ou number)
Dica: O wireframe disponibilizado é só uma referência. Melhorias podem sempre ser adicionadas
ao projeto durante o desenvolvimento.
TESTE
React.js + Node.js + Cloud
Briefing
TESTE
React.js + Node.js + Cloud
Wireframe
Meus álbuns de fotos
E-mail
Senha
Cadastre-se Entrar
Meus álbuns de fotos
E-mail
Senha
Cancelar Concluir
Nome
Autentique-se Faça seu cadastro:
1 - Tela de Login 2 - Tela de cadastro
Meus álbuns de fotos
Criar novo álbum
Olá, Bruno [sair]
3 - Tela de álbuns
Álbum 1
Descrição do álbum um
Álbum 2
Descrição do álbum um
Álbum 3
Descrição do álbum um
Álbum 4
Descrição do álbum um
Álbum 5
Descrição do álbum 5
TESTE
React.js + Node.js + Cloud
Meus álbuns de fotos
Adicionar fotos
Olá, Bruno [sair]
4 - Tela de um álbum específico em miniaturas
Álbum de aniversário
Descrição do meu álbum Visualizar como: Tabela / Miniaturas
Meus álbuns de fotos
Adicionar fotos
Olá, Bruno [sair]
5 - Tela de um álbum específico em tabela
Álbum de aniversário
Descrição do meu álbum Visualizar como: Tabela / Miniaturas
Foto Tamanho Data de aquisição Cor predominante
1.jpg 255kb 12/04/2021 10:24 #ccbbff
2.png 96bytes 14/03/2020 15:00 #42fbcc
Excluir álbum
TESTE
React.js + Node.js + Cloud
Meus álbuns de fotos
Adicionar fotos
Olá, Bruno [sair]
6 - Tela de uma foto ampliada
Álbum de aniversário
Descrição do meu álbum
7 - Tela para envio de novas fotos
Visualizar como: Tabela / Miniaturas
Título da foto
Descrição
Excluir foto
Meus álbuns de fotos
Adicionar fotos
Olá, Bruno [sair]
Álbum de aniversário
Descrição do meu álbum Visualizar como: Tabela / Miniaturas
Adicionar novas fotos
Enviar
Fechar
Escolher arquivo...
Fechar
Título
Descrição
Data/Hora de aquisição
Cor predominante
TESTE
React.js + Node.js + Cloud
Meus álbuns de fotos
Criar novo álbum
Olá, Bruno [sair]
Álbum 1
Descrição do álbum um
Álbum 2
Descrição do álbum um
Álbum 3
Descrição do álbum um
Álbum 4
Descrição do álbum um
Álbum 5
Descrição do álbum 5
8 - Tela para criar novo álbum
Criar novo álbum
Concluir
Fechar
Título
Descrição
A lista a seguir possui sugestões de características e funcionalidades que podem ser
desenvolvidas para agregar valor ao projeto e, principalmente à experiência do usuário.
● Uso de material-ui, chakra, tailwind ou outro framework de interface
● Formulário de recuperação de senha com envio de link por e-mail
● Validação de preenchimento em todos os campos de entrada do usuário (número, data,
texto, vazio, etc)
● Autenticação/Cadastro com provedor terceiro (Google, Facebook, Github, Apple, etc)
● Detecção automática da cor predominante da foto enviada
● Detecção automática da data/hora de aquisição a partir dos metadados da imagem (exif)
● Possibilidade de ordenação das fotos por ordem de aquisição (crescente ou decrescente)
● Possibilidade de compartilhar o link de um álbum de fotos como público (URL deverá ter
um token de autenticação)
● Drag-and-drop para upload de fotos
● Validação do mime-type do arquivo
● Upload de pasta inteira
● Paginação de itens
● Uso de Docker
● Microsserviços
● Serverless
TESTE
React.js + Node.js + Cloud
Características bônus