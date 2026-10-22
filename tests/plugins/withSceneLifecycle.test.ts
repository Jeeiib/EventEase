import { adoptSceneLifecycle } from '../../plugins/withSceneLifecycle';

// Extrait du gabarit AppDelegate.swift d'Expo SDK 57.
const TEMPLATE = `class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  override func application() -> Bool {
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
    return true
  }
}
`;

test('déplace le démarrage de React Native dans un SceneDelegate', () => {
  const out = adoptSceneLifecycle(TEMPLATE);
  expect(out).toContain('class SceneDelegate: UIResponder, UIWindowSceneDelegate');
  expect(out).toContain('var launchOptions: [UIApplication.LaunchOptionsKey: Any]?');
  expect(out).not.toContain('UIWindow(frame: UIScreen.main.bounds)');
  expect(out.match(/factory\.startReactNative/g)).toHaveLength(1);
});

test('ne change rien au second passage', () => {
  const once = adoptSceneLifecycle(TEMPLATE);
  expect(adoptSceneLifecycle(once)).toBe(once);
});

test('refuse un gabarit inconnu plutôt que de produire une app qui plante', () => {
  expect(() => adoptSceneLifecycle('class AppDelegate {}')).toThrow(/gabarit Expo 57/);
});
