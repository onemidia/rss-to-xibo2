const fs = require('fs');
const fetch = require('node-fetch');
const xml2js = require('xml2js');

// Função para obter e converter o RSS para o formato Xibo
const convertRssToXibo = async (rssUrl) => {
  try {
    // Buscar os dados do RSS
    const response = await fetch(rssUrl);
    const rssData = await response.text();

    // Converter o RSS para JSON de forma assíncrona
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(rssData);

    // Criar o novo XML no formato adequado para o Xibo
    const builder = new xml2js.Builder({ headless: true, cdata: true });
    const xml = builder.buildObject({
      rss: {
        $: { version: '2.0' },
        channel: {
          title: 'Tribuna Online',
          link: 'https://www.tribunaonline.net/feed/',
          description: 'Últimas notícias do Tribuna Online',
          item: result.rss.channel[0].item.map(item => {
            // Extrair a URL da imagem do description
            const description = item.description[0];
            const imageUrl = description.match(/<img.*?src=["'](.*?)["']/);
            const linkfoto = imageUrl ? imageUrl[1] : ''; // Extrair a URL da imagem, caso exista

            // Imprimir o link da foto para depuração
            console.log('Imagem URL:', linkfoto);

            // Retornar os dados no formato adequado para o Xibo, sem o HTML
            return {
              title: item.title[0], // Título da notícia
              link: item.link[0], // Link da notícia
              description: item.description[0].replace(/<img[^>]*>/g, ''), // Descrição sem a imagem
              image: linkfoto // Apenas o link da imagem
            };
          })
        }
      }
    });

    // Salvar o XML em um arquivo local
    fs.writeFileSync('xibo_feed.xml', xml);
    console.log('XML gerado com sucesso!');

    // Retornar o XML para uso na API
    return xml;
  } catch (error) {
    console.error('Erro ao buscar ou converter RSS:', error);
    throw error; // Lança o erro para ser tratado em outro local
  }
};

// Exportar a função para ser usada em outros arquivos
module.exports = convertRssToXibo;
