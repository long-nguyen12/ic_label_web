import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import PizZipUtils from "pizzip/utils";
import { saveAs } from "file-saver";
import { getDataFile, getDataSalebills } from './File.utils';
import ImageModule from "docxtemplater-image-module-free";
import moment from "moment";

export function convertParam(queryObj, firstCharacter = "?") {
  if (typeof queryObj !== "object") return "";
  let query = "";
  Object.entries(queryObj).forEach(([key, value]) => {
    if (value || value === 0 || value === "0") {
      query += query ? "&" : firstCharacter || "";
      query += `${key}=${value}`;
    }
  });
  return query;
}

export function convertFileName(str) {
  if (!str) return "";

  str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
  str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
  str = str.replace(/[ìíịỉĩ]/g, "i");
  str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
  str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
  str = str.replace(/[ỳýỵỷỹ]/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, "A");
  str = str.replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, "E");
  str = str.replace(/[ÌÍỊỈĨ]/g, "I");
  str = str.replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, "O");
  str = str.replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, "U");
  str = str.replace(/[ỲÝỴỶỸ]/g, "Y");
  str = str.replace(/Đ/g, "D");
  str = str.replace(/\s+/g, " ");
  str.trim();
  return str;
}

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

function getPathFile(type_file) {
  let pathFile = "";
  if (type_file == "baocao") {
    pathFile = "/DocxTemplate/baocao.docx";
  } else if (type_file == "donhang") {
    pathFile = "/DocxTemplate/donhang.docx";
  } else if (type_file == "Hoa_don_ban_hang") {
    pathFile = "/DocxTemplate/hoadonbanhang.docx";
  }
  return pathFile;
}

export const renderDocAndImg = (dangkyRes, type_file) => {
  let pathFile = getPathFile(type_file);
  let dataFile = getDataFile(dangkyRes);
  let heightImg = dangkyRes.loaimauketqua === "2" ? 141 : dangkyRes.loaimauketqua === "4" ? 116 : 0;
  let widthImg = dangkyRes.loaimauketqua === "2" ? 191 : dangkyRes.loaimauketqua === "4" ? 173 : 0;
  console.log(dataFile, "dataFile");

  loadFile(pathFile, function (error, content) {
    if (error) {
      throw error;
    }
    const imageOpts = {
      getImage: function (tagValue, tagName) {
        return new Promise(function (resolve, reject) {
          PizZipUtils.getBinaryContent(tagValue, function (error, content) {
            if (error) {
              return reject(error);
            }
            return resolve(content);
          });
        });
      },
      getSize: function (img, tagValue, tagName) {
        // FOR FIXED SIZE IMAGE :
        return [`${widthImg}`, `${heightImg}`];
      },
    };
    var imageModule = new ImageModule(imageOpts);
    const zip = new PizZip(content);
    const doc = new Docxtemplater()
      .loadZip(zip)
      .setOptions({
        // delimiters: { start: "[[", end: "]]" },
        paragraphLoop: true,
        linebreaks: true,
      })
      .attachModule(imageModule)
      .compile();
    doc.renderAsync(dataFile).then(function () {
      const out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformatsofficedocument.wordprocessingml.document",
      });
      saveAs(out, `${type_file}` + "_" + `${dataFile.hoten}` + ".docx");
    });
  });
};

export const generateDocument = (dangkyRes, type_file) => {
  let pathFile = getPathFile(type_file);
  loadFile(pathFile, function (error, content) {
    let dataFile = getDataSalebills(dangkyRes);
    if (error) {
      throw error;
    }

    // tạo index cho bảng
    function parser(tag) {
      return {
        get(scope, context) {
          if (tag === "$index") {
            const indexes = context.scopePathItem;
            return indexes[indexes.length - 1] + 1;
          }
          return scope[tag];
        },
      };
    }

    function nullGetter(part, scopeManager) {
      if (!part.module) {
        return "";
      }
      if (part.module === "rawxml") {
        return "";
      }
      return "";
    }

    var zip = new PizZip(content);
    var doc = new Docxtemplater().loadZip(zip);
    doc.setOptions({ parser, nullGetter });
    doc.setData(dataFile);
    try {
      // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
      doc.render();
    } catch (error) {
      // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
      function replaceErrors(key, value) {
        if (value instanceof Error) {
          return Object.getOwnPropertyNames(value).reduce(function (error, key) {
            error[key] = value[key];
            return error;
          }, {});
        }
        return value;
      }

      console.log(JSON.stringify({ error: error }, replaceErrors));

      if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors
          .map(function (error) {
            return error.properties.explanation;
          })
          .join("\n");
        console.log("errorMessages", errorMessages);
        // errorMessages is a humanly readable message looking like this :
        // 'The tag beginning with "foobar" is unopened'
      }
      throw error;
    }
    var out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }); //Output the document using Data-URI
    saveAs(out, `${type_file}_${moment().format('DD-MM-YYYY')}` + ".docx");
  });
};
