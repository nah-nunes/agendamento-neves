const { google } = require('googleapis');

exports.handler = async function (event, context) {
  try {
    const dados = JSON.parse(event.body);

    // Validação com os campos do seu formulário
    // O serviço, data e hora virão do JS do frontend
    if (!dados.nome || !dados.telefone || !dados.data || !dados.hora || !dados.servico) {
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({ mensagem: 'Dados incompletos.' }),
      };
    }

 // 2. Autenticação com o Google
    // Puxa o JSON INTEIRO da variável de ambiente e o "parseia"
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key, // O JSON.parse já formatou a chave corretamente!
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Nova linha com 7 colunas (A até G)
    const novaLinha = [
      dados.data,
      dados.hora,
      dados.nome,
      dados.telefone,
      dados.servico,
      'Pendente', // Status Padrão
      dados.observacoes || '', // Se 'observacoes' não for enviado, fica em branco
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      // Mude 'Pagina1' para o nome da sua aba
      // Mude o range para A:G para incluir a nova coluna
      range: 'Folha1!A:G', 
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [novaLinha],
      },
    });

    // Retorna sucesso
    return {
      statusCode: 200,
      body: JSON.stringify({
        mensagem: 'Agendamento realizado com sucesso!',
        dadosSalvos: novaLinha, // Devolve os dados para o frontend
      }),
    };
  } catch (error) {
    console.error('Erro ao processar agendamento:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        mensagem: 'Ocorreu um erro no servidor.',
        erro: error.message,
      }),
    };
  }
};