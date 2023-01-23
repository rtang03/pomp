const colors = {
  ['BLUE' as string]: '#8b5cf6',
  RED: '#655a1a'
};

const consoleLog = (label: string, val: any, asTable?: boolean, color?: string): void => {
  console.log(
    `%c[${label}]`,
    `color: ${
      colors[color || 'BLUE']
    }; font-weight: bolder; background-color: #245057; padding: 0.2rem 1.5rem;`
  );
  if (asTable) console.table(val);
  else console.log(val);
};

export const log = consoleLog;
export const elog = (label: string, val: any) => consoleLog(label, val, false, 'RED');

export default consoleLog;
