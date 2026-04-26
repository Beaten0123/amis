// Mock for monaco-editor in tests
export default {};
export const monaco = {
  editor: {
    create: () => ({
      dispose: () => {},
      layout: () => {},
      getValue: () => '',
      setValue: () => {},
      getModel: () => null,
      setModel: () => {}
    })
  },
  KeyCode: {},
  MarkerSeverity: {},
  Range: class {}
};
