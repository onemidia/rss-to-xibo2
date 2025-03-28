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
    const builder = new xml2js.Builder({ cdata: true });
    const xml = builder.buildObject({
      rss: {
        $: { version: '2.0' },
        channel: {
          title: result.rss.channel[0].title[0],
          link: result.rss.channel[0].link[0],
          description: result.rss.channel[0].description[0],
          item: result.rss.channel[0].item.map(item => {
            // Extrair a URL da imagem do description
            const description = item.description[0];
            const imageUrlMatch = description.match(/<img.*?src=["'](.*?)["']/);
            const imageUrl = imageUrlMatch ? imageUrlMatch[1] : '';

            // Remover a tag <img> do description
            const cleanDescription = description.replace(/<img[^>]*>/g, '').trim();

            return {
              title: item.title[0],
              description: cleanDescription,
              linkfoto: imageUrl
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
