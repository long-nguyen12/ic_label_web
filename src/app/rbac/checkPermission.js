import { ConstantsRoutes } from "@app/router/ConstantsRoutes";

export function checkPermission(permissionGranted, path = "") {
  // console.log('permissions', permissionGranted, path)
  let requiredPermissions = [];
  const pathRequired = path[0] === "/" ? path.substring(1) : path;

  function getRequiredPermissions(item) {
    const permissionPath = item?.path[0] === "/" ? item?.path?.substring(1) : path;
    return permissionPath === pathRequired ? item.permission || [] : [];
  }

  ConstantsRoutes.forEach((per) => {
    // if (!per.children && per.path) {
    //   requiredPermissions = !requiredPermissions.length ? getRequiredPermissions(per) : requiredPermissions;
    // } else {
    //   let parentPermissions = [];
    //   parentPermissions = !parentPermissions.length ? getRequiredPermissions(per) : parentPermissions;

    //   per.children.forEach((child) => {
    //     requiredPermissions = !requiredPermissions.length ? getRequiredPermissions(child) : requiredPermissions;
    //   });
    // }
    requiredPermissions = !requiredPermissions.length ? getRequiredPermissions(per) : requiredPermissions;
  });

  return !requiredPermissions.length || requiredPermissions.includes(permissionGranted);
}
