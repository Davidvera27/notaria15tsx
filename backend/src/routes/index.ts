import { Router } from "express";
import { readdirSync } from "fs";

const PATH_ROUTER = `${__dirname}`;
const router = Router();

const cleanFileName = (filName: string) => {
  const file = filName.split(".").shift();
  return file;
};

readdirSync(PATH_ROUTER)
  .filter((filName) => {
    const cleanName = cleanFileName(filName);
    // Filtrar solo los archivos que no sean index.ts
    return cleanName !== "index";
  })
  .forEach((filName) => {
    const cleanName = cleanFileName(filName);
    import(`./${cleanName}`).then((moduleRouter) => {
      // Verificar que el módulo importado contenga el router
      if (moduleRouter && moduleRouter.router) {
        console.log(`Se está cargando la ruta ${cleanName}`);
        router.use(`/${cleanName}`, moduleRouter.router); // Usamos router desde el módulo importado
      } else {
        console.error(`El módulo ${cleanName} no contiene un objeto 'router' exportado.`);
      }
    }).catch((error) => {
      console.error(`Error al cargar la ruta ${cleanName}:`, error);
    });
  });

export { router };
