function convertNamedQuery(text, params) {
  if (params === undefined || params === null) {
    return { text, values: undefined };
  }

  // Tambien permite usar los parametros posicionales nativos de pg.
  if (Array.isArray(params)) {
    return { text, values: params };
  }

  const values = [];
  const positions = new Map();
  const convertedText = text.replace(/@(\w+)/g, (_match, key) => {
    if (!Object.prototype.hasOwnProperty.call(params, key)) {
      throw new Error(`Missing parameter value for key: ${key}`);
    }

    if (!positions.has(key)) {
      values.push(params[key]);
      positions.set(key, `$${values.length}`);
    }

    return positions.get(key);
  });

  return { text: convertedText, values };
}

module.exports = { convertNamedQuery };
