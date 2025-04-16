export const groupByDeceased = (list) => {
  const grouped = {};

  list.forEach(({ deceasedCode, deceasedName, serviceCode }) => {
    if (!grouped[deceasedCode]) {
      grouped[deceasedCode] = {
        deceasedCode,
        deceasedName,
        services: new Set(),
      };
    }

    grouped[deceasedCode].services.add(serviceCode);
  });

  return Object.values(grouped).map((group) => ({
    ...group,
    services: Array.from(group.services).sort(),
  }));
};
