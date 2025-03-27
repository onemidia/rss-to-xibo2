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
    const builder = new xml2js.Builder();
    const xml = builder.buildObject({
      rss: {
        $: { version: '2.0' },
        channel: {
          title: '<![CDATA[Tribuna Online]]>',
          link: 'https://www.tribunaonline.net/feed/',
          description: '<![CDATA[Últimas notícias do Tribuna Online]]>',
          item: result.rss.channel[0].item.map(item => {
            // Extrair a URL da imagem do description
            const description = item.description[0];
            const imageUrl = description.match(/<img.*?src=["'](.*?)["']/);
            const linkfoto = imageUrl ? imageUrl[1] : ''; // Extrair a URL da imagem, caso exista

            // Formatar o conteúdo para Xibo
            return {
              title: `<![CDATA[${item.title[0]}]]>`,
              link: item.link[0],
              description: `<![CDATA[${item.description[0].replace(/<img[^>]*>/g, '')}]]>`, // Remover a imagem do description e incluir CDATA
              pubDate: `<![CDATA[${item.pubDate[0]}]]>`,
              // Formatar linkfoto dentro do layout HTML com CDATA
              linkfoto: `<![CDATA[<div class="image">[linkfoto|image]<div class="cycle-overlay"><img alt="" src="${linkfoto}" style="width: 200px; height: 200px; margin-top: 200px;" /><p style="font-family: Arial, Verdana, sans-serif; font-size:60px; color:#ffffff;"><span style="color:#ffcc00;"><strong>[Title]</strong></span></p><p style="font-family: Arial, Verdana, sans-serif; font-size:50px; color:#ffffff;">[Description]</p></div></div>]]>`
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
