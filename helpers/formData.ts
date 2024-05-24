export const transformRequest = (data: any) => {
  const formData = new FormData();

  function transformModel(
    object: { [key: string]: any },
    formData: FormData,
    index?: number,
  ) {
    Object.keys(object).forEach((init_key) => {
      const value =
        object[init_key] || object[init_key] === 0 || object[init_key] === ""
          ? object[init_key]
          : null;
      if (!init_key.startsWith("$")) {
        let key = init_key;

        if (index !== undefined) {
          key = init_key + "[" + index.toString() + "]";
        }

        if (value instanceof Blob) {
          formData.append(init_key + "_" + index, value);
        } else if (value instanceof Object) {
          formData.append(key, JSON.stringify(value));
        } else if (value || value === 0) {
          formData.append(key, value);
        } else {
          formData.append(key, "");
        }
      }
    });
  }

  try {
    if (data.model instanceof Array) {
      for (let i = 0; i < data.model.length; i++) {
        const object = data.model[i];
        transformModel(object, formData, i);
      }
    } else if (Object.keys(data.model).length) {
      transformModel(data.model, formData);
    }

    if (data.files && Object.keys(data.files).length) {
      for (const key in data.files) {
        formData.append(key, data.files[key]);
      }
    }
    if (data.token) {
      formData.append("token", data.token);
    } else {
      if (data.application_id)
        formData.append("application_id", data.application_id);
    }
  } catch (e) {
    console.error(e);
  }
  return formData;
};

export const toMultiPart = (model: any) => {
  const data = Array.from(transformRequest({ model }).entries()).reduce(
    (acc: any, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {},
  );
  return data;
};
