import { Builder } from 'xml2js';

export function parserToXml(data: Object) {
  if (Array.isArray(data)) {
    throw new Error('Data must be an object');
  }

  const addPrefix = (obj: any, prefix: string) => {
    if (Array.isArray(obj)) {
      return obj.map((item) => addPrefix(item, prefix));
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj: any = {};
      for (const key of Object.keys(obj)) {
        let value = obj[key];
        if (value === null || value === '') {
          value = '?'; // Substitui por '?' se for null ou vazio
        }
        newObj[`${prefix}${key}`] = addPrefix(value, prefix); // Chama recursivamente para objetos aninhados
      }
      return newObj;
    }
    return obj;
  };

  const builder = new Builder();

  const xml = builder.buildObject(addPrefix(data, 'deal:'));

  return xml
    .replace(/<\?xml(.+?)\?>/g, '') // Remove a declaração XML
    .replace(`<root>`, '') // Remove a tag root
    .replace(`</root>`, '');
}

export function formatarDoc(doc: number | string): string {
  if (!doc) return '?';

  const document = doc.toString().replace(/\D/g, '');

  return document.length <= 11 ? document?.padStart(11, '0') : document?.padStart(14, '0');
}
