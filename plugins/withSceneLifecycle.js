// Config plugin : l'app adopte le cycle de vie UIScene, exigé par le SDK iOS 27.
//
// Compilée avec Xcode 27, une app qui ne l'a pas adopté plante au lancement (SIGTRAP dans
// `_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`). Ni Expo SDK 57 ni React Native
// 0.86 ne le gèrent encore : le plugin réécrit l'AppDelegate généré à chaque prebuild.
//
// Déclarer le manifeste ne suffit pas : la fenêtre créée avec `UIScreen.main.bounds` ne serait
// rattachée à aucune scène et l'app resterait sur un écran noir. La fenêtre doit naître de la
// `UIWindowScene`, donc le démarrage de React Native passe dans le delegate de scène.
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

// Un second prebuild ne doit pas ajouter un second SceneDelegate.
const MARKER = '// scene-lifecycle';

// Ancres du gabarit Expo 57 : s'il change, mieux vaut un prebuild en échec qu'une app qui plante.
const WINDOW_LINE = /^[ \t]*window = UIWindow\(frame: UIScreen\.main\.bounds\)\r?\n/m;
const START_REACT_NATIVE = /^[ \t]*factory\.startReactNative\(\r?\n[\s\S]*?launchOptions: launchOptions\)\r?\n/m;
const WINDOW_PROPERTY = '  var window: UIWindow?\n';

const SCENE_MANIFEST = {
  UIApplicationSupportsMultipleScenes: false,
  UISceneConfigurations: {
    UIWindowSceneSessionRoleApplication: [
      {
        UISceneConfigurationName: 'Default Configuration',
        UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
      },
    ],
  },
};

// Ajouté dans AppDelegate.swift plutôt que dans un fichier à part : même module, rien à toucher
// dans le projet Xcode.
const SCENE_DELEGATE = `
${MARKER}
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else {
      return
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    // React Native va encore chercher la fenetre sur l'AppDelegate.
    appDelegate.window = window

    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: appDelegate.launchOptions)

    // Sous les scenes, application(_:open:options:) n'est plus appelee : un lien qui lance l'app
    // arrive ici.
    for context in connectionOptions.urlContexts {
      open(context.url)
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      open(context.url)
    }
  }

  private func open(_ url: URL) {
    _ = UIApplication.shared.delegate?.application?(UIApplication.shared, open: url, options: [:])
  }
}
`;

/** Rend `AppDelegate.swift` compatible avec les scènes ; sans effet s'il l'est déjà. */
function adoptSceneLifecycle(contents) {
  if (contents.includes(MARKER)) return contents;
  if (!WINDOW_LINE.test(contents) || !START_REACT_NATIVE.test(contents) || !contents.includes(WINDOW_PROPERTY)) {
    throw new Error(
      "[withSceneLifecycle] AppDelegate.swift ne correspond plus au gabarit Expo 57 : mettre ce plugin à jour, sinon l'app plante au lancement sur iOS 27.",
    );
  }
  return (
    contents
      .replace(WINDOW_LINE, '    self.launchOptions = launchOptions\n')
      .replace(START_REACT_NATIVE, '')
      .replace(WINDOW_PROPERTY, `${WINDOW_PROPERTY}  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?\n`) +
    SCENE_DELEGATE
  );
}

module.exports = function withSceneLifecycle(config) {
  const withManifest = withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = SCENE_MANIFEST;
    return cfg;
  });
  return withAppDelegate(withManifest, (cfg) => {
    cfg.modResults.contents = adoptSceneLifecycle(cfg.modResults.contents);
    return cfg;
  });
};

module.exports.adoptSceneLifecycle = adoptSceneLifecycle;
