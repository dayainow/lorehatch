import Cocoa
import WebKit
import Network
import UniformTypeIdentifiers
import Darwin

final class LocalSite {
    let root: URL
    let token = UUID().uuidString
    let listener: NWListener
    let queue = DispatchQueue(label: "lorehatch.local-site")
    var port: UInt16 { listener.port!.rawValue }
    var home: URL { URL(string: "http://127.0.0.1:\(port)/\(token)/")! }
    init(root: URL) throws {
        self.root = root
        let parameters = NWParameters.tcp
        parameters.requiredLocalEndpoint = .hostPort(host: "127.0.0.1", port: .any)
        listener = try NWListener(using: parameters)
    }
    func start(ready: @escaping () -> Void, failed: @escaping (String) -> Void) {
        listener.stateUpdateHandler = { state in
            switch state { case .ready: DispatchQueue.main.async(execute: ready)
            case .failed(let error): DispatchQueue.main.async { failed(error.localizedDescription) }
            default: break }
        }
        listener.newConnectionHandler = { [weak self] connection in
            guard let self else { return }; connection.start(queue: self.queue)
            self.receive(connection, data: Data())
            self.queue.asyncAfter(deadline: .now()+5) { connection.cancel() }
        }
        listener.start(queue: queue)
    }
    func receive(_ connection: NWConnection, data: Data) {
        connection.receive(minimumIncompleteLength: 1, maximumLength: 8192) { [weak self] chunk, _, complete, error in
            guard let self, error == nil else { connection.cancel(); return }
            var request = data; if let chunk { request.append(chunk) }
            if request.count > 16384 { connection.cancel(); return }
            if let string = String(data: request, encoding: .utf8), string.contains("\r\n\r\n") {
                self.respond(connection, request: string)
            } else if !complete { self.receive(connection, data: request) } else { connection.cancel() }
        }
    }
    func respond(_ connection: NWConnection, request: String) {
        let first = request.components(separatedBy: "\r\n").first?.split(separator: " ") ?? []
        var body = Data(); var status = "404 Not Found"; var type = "text/plain"
        if first.count == 3, ["GET", "HEAD"].contains(String(first[0])),
           let parts = URLComponents(string: "http://localhost\(first[1])"),
           parts.path.hasPrefix("/\(token)/") {
            let relative = String(parts.path.dropFirst(token.count+2))
            let name = relative.isEmpty ? "index.html" : relative
            let file = root.appendingPathComponent(name).standardizedFileURL
            if !name.split(separator: "/").contains(where: { $0.hasPrefix(".") }), file.path.hasPrefix(root.path+"/"), let data = try? Data(contentsOf: file) {
                body = data; status = "200 OK"
                type = ["html":"text/html; charset=utf-8", "mjs":"text/javascript; charset=utf-8", "js":"text/javascript; charset=utf-8", "css":"text/css; charset=utf-8", "json":"application/json", "svg":"image/svg+xml", "png":"image/png", "woff2":"font/woff2", "webmanifest":"application/manifest+json"][file.pathExtension] ?? "application/octet-stream"
            }
        }
        if ProcessInfo.processInfo.environment["LOREHATCH_DEBUG"] == "1" { fputs("Local response: \(status), \(body.count) bytes\n", stderr) }
        let headers = "HTTP/1.1 \(status)\r\nContent-Type: \(type)\r\nContent-Length: \(body.count)\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n"
        var response = Data(headers.utf8); if first.first != "HEAD" { response.append(body) }
        connection.send(content: response, completion: .contentProcessed { _ in connection.cancel() })
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate, WKNavigationDelegate, WKUIDelegate {
    var window: NSWindow!
    var web: WKWebView!
    var site: LocalSite!
    var store: SaveStore!
    var statusItem: NSStatusItem!
    let companionView = CompanionView(frame:NSRect(x:0,y:0,width:96,height:96))
    var companionPanel: NSPanel!
    var companionKey="egg"
    var activityTimer: Timer?
    var companionStill=false
    let companionItem=NSMenuItem()
    func setupCompanion(){
        let bounds=NSScreen.main?.visibleFrame ?? NSRect(x:0,y:0,width:800,height:600)
        let frame=NSRect(x:bounds.maxX-120,y:bounds.minY+24,width:96,height:96)
        let panel=NSPanel(contentRect:frame,styleMask:[.borderless,.nonactivatingPanel],backing:.buffered,defer:false)
        panel.isOpaque=false;panel.backgroundColor = .clear;panel.hasShadow=false
        panel.level = .floating;panel.hidesOnDeactivate=false;panel.isReleasedWhenClosed=false
        panel.collectionBehavior=[.canJoinAllSpaces,.fullScreenAuxiliary]
        panel.contentView=companionView;panel.setFrameAutosaveName("MoamonCompanion")
        companionView.openGarden = { [weak self] in self?.showWindow() }
        companionView.care = { [weak self] in
            self?.showWindow()
            self?.web.evaluateJavaScript("window.dispatchEvent(new Event('moamon-pet-care'))",completionHandler:nil)
        }
        companionView.hidePet = { [weak self] in self?.toggleCompanion() }
        companionView.moved = { [weak self] in self?.restoreCompanionPosition() }
        companionView.resizePet = { [weak self] size in
            guard let self else{return}
            self.companionPanel.setContentSize(NSSize(width:size,height:size))
            UserDefaults.standard.set(Double(size),forKey:"companionSize")
            self.restoreCompanionPosition()
        }
        companionView.toolTip="클릭해 돌보기 · 끌어서 이동 · 두 번 클릭해 정원 열기"
        companionPanel=panel
        let size=UserDefaults.standard.double(forKey:"companionSize")==144 ? 144.0 : 96.0
        panel.setContentSize(NSSize(width:size,height:size))
        if let saved=UserDefaults.standard.string(forKey:"companionOrigin") { panel.setFrameOrigin(NSPointFromString(saved)) }
        restoreCompanionPosition()
        observers.append(NotificationCenter.default.addObserver(forName:NSApplication.didChangeScreenParametersNotification,object:nil,queue:.main){[weak self] _ in self?.restoreCompanionPosition()})
        companionItem.title="화면에 펫 띄우기";companionItem.target=self;companionItem.action=#selector(toggleCompanion)
        if UserDefaults.standard.object(forKey:"showCompanion") as? Bool ?? true { panel.orderFrontRegardless();companionItem.state = .on }
        companionView.showSprite(companionKey,reduced:companionStill)
    }
    func restoreCompanionPosition(){
        guard let panel=companionPanel else{return}
        let visible=NSScreen.screens.map(\.visibleFrame)
        guard let screen=visible.first(where:{$0.intersects(panel.frame)}) ?? visible.first else{return}
        let x=max(screen.minX,min(panel.frame.minX,screen.maxX-panel.frame.width))
        let y=max(screen.minY,min(panel.frame.minY,screen.maxY-panel.frame.height))
        panel.setFrameOrigin(NSPoint(x:x,y:y))
        UserDefaults.standard.set(NSStringFromPoint(panel.frame.origin),forKey:"companionOrigin")
    }
    @objc func toggleCompanion(){
        if companionPanel.isVisible { companionPanel.orderOut(nil) } else { companionPanel.orderFrontRegardless() }
        companionItem.state=companionPanel.isVisible ? .on : .off
        UserDefaults.standard.set(companionPanel.isVisible,forKey:"showCompanion")
        companionView.showSprite(companionKey,reduced:companionStill)
    }
    let petStatus = NSMenuItem()
    let careAction = NSMenuItem()
    var lockDescriptor: Int32 = -1
    var observers: [NSObjectProtocol] = []
    func applicationDidFinishLaunching(_ notification: Notification) {
        do {
            let dataRoot = ProcessInfo.processInfo.environment["LOREHATCH_DATA_DIR"].map { URL(fileURLWithPath: $0) } ?? FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("Lorehatch")
            try FileManager.default.createDirectory(at: dataRoot, withIntermediateDirectories: true)
            lockDescriptor = open(dataRoot.appendingPathComponent(".lock").path, O_CREAT | O_RDWR, 0o600)
            guard lockDescriptor >= 0, flock(lockDescriptor, LOCK_EX | LOCK_NB) == 0 else { fatal("정원이 이미 실행 중이에요. 메뉴바에서 정원을 열어주세요."); return }
            store = try SaveStore(folder: dataRoot)
            guard let root = Bundle.main.resourceURL?.appendingPathComponent("site") else { throw StoreError.corrupt }
            site = try LocalSite(root: root)
            site.start(ready: { [weak self] in self?.createWindow() }, failed: { [weak self] in self?.fatal($0) })
        } catch { fatal(error.localizedDescription) }
    }
    func fatal(_ message: String) { let alert=NSAlert(); alert.messageText="정원을 열지 못했어요"; alert.informativeText=message; alert.runModal(); NSApp.terminate(nil) }
    func createWindow() {
        let config = WKWebViewConfiguration()
        let script = """
        (()=>{const request=(action,payload={})=>{const reply=JSON.parse(prompt('__LOREHATCH_NATIVE__',JSON.stringify({action,...payload})));if(reply.error)throw Error(reply.error);return reply.value;};window.lorehatchDesktop={...request('status'),companion:command=>request('companion',{command}),react:()=>request('react'),menu:(line,label,sprite,still)=>request('menu',{line,label,sprite,still}),storage:{getItem:key=>request('get',{key}),setItem:(key,value)=>request('set',{key,value}),removeItem:key=>request('remove',{key})},download:(name,base64)=>request('download',{name,base64})};})();
        """
        config.userContentController.addUserScript(WKUserScript(source: script, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        web = WKWebView(frame: .zero, configuration: config); web.navigationDelegate=self; web.uiDelegate=self
        web.setValue(false, forKey: "drawsBackground")
        window = NSWindow(contentRect: NSRect(x:0,y:0,width:1180,height:820), styleMask:[.titled,.closable,.miniaturizable,.resizable], backing:.buffered, defer:false)
        window.title="모아몬"; window.minSize=NSSize(width:390,height:600); window.contentView=web; window.delegate=self; window.isReleasedWhenClosed=false
        window.setFrameAutosaveName("LorehatchMainWindow"); window.center(); window.makeKeyAndOrderFront(nil)
        buildMenus(); web.load(URLRequest(url:site.home));
        activityTimer=Timer.scheduledTimer(withTimeInterval:5,repeats:true){[weak self] _ in
            guard let self, let raw=try? String(contentsOf:self.store.folder.appendingPathComponent("activity-signal"),encoding:.utf8), let timestamp=Int64(raw), timestamp>0 else{return}
            self.web.evaluateJavaScript("window.dispatchEvent(new CustomEvent('moamon-activity',{detail:\(timestamp)}))",completionHandler:nil)
        }
 NSApp.activate(ignoringOtherApps:true)
        let center=NSWorkspace.shared.notificationCenter
        for name in [NSWorkspace.willSleepNotification, NSWorkspace.sessionDidResignActiveNotification] {
            observers.append(center.addObserver(forName:name,object:nil,queue:.main){[weak self] _ in self?.web.evaluateJavaScript("window.dispatchEvent(new Event('lorehatch-suspend'))")})
        }
    }
    func buildMenus() {
        let menu=NSMenu(); let appItem=NSMenuItem(); let appMenu=NSMenu()
        appMenu.addItem(withTitle:"모아몬에 관하여",action:#selector(showAbout),keyEquivalent:"")
        appMenu.addItem(.separator()); appMenu.addItem(withTitle:"모아몬 숨기기",action:#selector(NSApplication.hide(_:)),keyEquivalent:"h")
        appMenu.addItem(withTitle:"모아몬 종료",action:#selector(NSApplication.terminate(_:)),keyEquivalent:"q"); appItem.submenu=appMenu; menu.addItem(appItem)
        let editItem=NSMenuItem(); let edit=NSMenu(title:"편집")
        for (title,selector,key) in [("실행 취소","undo:","z"),("잘라내기","cut:","x"),("복사","copy:","c"),("붙여넣기","paste:","v"),("전체 선택","selectAll:","a")] {edit.addItem(withTitle:title,action:Selector(selector),keyEquivalent:key)}
        editItem.submenu=edit;menu.addItem(editItem); NSApp.mainMenu=menu
        statusItem=NSStatusBar.system.statusItem(withLength:NSStatusItem.squareLength)
        statusItem.button?.image=NSImage(systemSymbolName:"leaf",accessibilityDescription:"모아몬")
        let status=NSMenu()
        petStatus.title="알을 고를 준비가 됐어요"; status.addItem(petStatus)
        careAction.title="첫 알 고르기"; careAction.target=self; careAction.action=#selector(careFromMenu)
        setupCompanion();status.addItem(companionItem);status.addItem(careAction); status.addItem(.separator())
        status.addItem(withTitle:"정원 열기",action:#selector(showWindow),keyEquivalent:"")
        status.addItem(withTitle:"항상 위에 표시",action:#selector(toggleFloating),keyEquivalent:"")
        status.addItem(withTitle:"저장 폴더 열기",action:#selector(showData),keyEquivalent:"")
        status.addItem(.separator());status.addItem(withTitle:"종료",action:#selector(NSApplication.terminate(_:)),keyEquivalent:"");statusItem.menu=status
    }
    @objc func careFromMenu(){
        showWindow()
        web.evaluateJavaScript("window.dispatchEvent(new Event('moamon-care'))")
    }
    @objc func showWindow(){window.makeKeyAndOrderFront(nil);NSApp.activate(ignoringOtherApps:true)}
    @objc func toggleFloating(_ sender:NSMenuItem){let enabled=window.level != .floating;window.level=enabled ? .floating : .normal;sender.state=enabled ? .on : .off}
    @objc func showData(){NSWorkspace.shared.open(store.folder)}
    @objc func showAbout(){let alert=NSAlert();alert.messageText="모아몬 0.6.0";alert.informativeText="로컬 저장으로 키우는 작은 도트 펫 정원\n앱 창이 보일 때 함께한 시간을 반영해요.\n메뉴바에서 다시 열거나 항상 위에 둘 수 있어요.";alert.runModal()}
    func windowShouldClose(_ sender: NSWindow)->Bool { web.evaluateJavaScript("window.dispatchEvent(new Event('lorehatch-suspend'))");sender.orderOut(nil);return false }
    func applicationShouldHandleReopen(_ sender:NSApplication,hasVisibleWindows:Bool)->Bool{showWindow();return true}
    func applicationShouldTerminate(_ sender:NSApplication)->NSApplication.TerminateReply {
        guard web != nil else{return .terminateNow}
        web.evaluateJavaScript("window.dispatchEvent(new Event('lorehatch-suspend'))"){_,_ in NSApp.reply(toApplicationShouldTerminate:true)}
        return .terminateLater
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        fputs("Page load failed: \(error)\n", stderr)
    }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        fputs("Page navigation failed: \(error)\n", stderr)
    }
    func webView(_ webView:WKWebView,decidePolicyFor action:WKNavigationAction,decisionHandler:@escaping(WKNavigationActionPolicy)->Void){
        guard let url=action.request.url else{decisionHandler(.cancel);return}
        if url.host=="127.0.0.1",url.port==Int(site.port),(url.path == "/\(site.token)" || url.path.hasPrefix("/\(site.token)/")){decisionHandler(.allow)}
        else {if action.navigationType == .linkActivated,url.scheme=="https"{NSWorkspace.shared.open(url)};decisionHandler(.cancel)}
    }
    func webView(_ webView:WKWebView,createWebViewWith configuration:WKWebViewConfiguration,for action:WKNavigationAction,windowFeatures:WKWindowFeatures)->WKWebView?{if let url=action.request.url,url.scheme=="https"{NSWorkspace.shared.open(url)};return nil}
    func webView(_ webView:WKWebView,runJavaScriptConfirmPanelWithMessage message:String,initiatedByFrame frame:WKFrameInfo,completionHandler:@escaping(Bool)->Void){let alert=NSAlert();alert.messageText=message;alert.addButton(withTitle:"계속하기");alert.addButton(withTitle:"취소");completionHandler(alert.runModal() == .alertFirstButtonReturn)}
    func webView(_ webView:WKWebView,runJavaScriptTextInputPanelWithPrompt prompt:String,defaultText:String?,initiatedByFrame frame:WKFrameInfo,completionHandler:@escaping(String?)->Void){
        guard prompt=="__LOREHATCH_NATIVE__",frame.isMainFrame,frame.request.url?.host=="127.0.0.1",frame.request.url?.port==Int(site.port) else{completionHandler(nil);return}
        do {
            let data=Data((defaultText ?? "").utf8)
            guard data.count<=4_000_000,let object=try JSONSerialization.jsonObject(with:data) as? [String:Any],let action=object["action"] as? String else{throw StoreError.invalidValue}
            var result:Any=NSNull()
            switch action {
            case "companion":
                guard let command=object["command"] as? String else{throw StoreError.invalidValue}
                switch command {
                case "toggle": toggleCompanion()
                case "small", "large":
                    let size:CGFloat=command=="large" ? 144 : 96
                    companionPanel.setContentSize(NSSize(width:size,height:size))
                    UserDefaults.standard.set(Double(size),forKey:"companionSize")
                    restoreCompanionPosition()
                case "reset":
                    if let screen=NSScreen.main?.visibleFrame {
                        companionPanel.setFrameOrigin(NSPoint(x:screen.maxX-companionPanel.frame.width-24,y:screen.minY+24))
                        restoreCompanionPosition()
                    }
                    if !companionPanel.isVisible { toggleCompanion() }
                case "status": break
                default: throw StoreError.invalidValue
                }
                result=["visible":companionPanel.isVisible,"size":Int(companionPanel.frame.width)]
            case "react": companionView.celebrate()
            case "menu":
                guard let line=object["line"] as? String, let label=object["label"] as? String else{throw StoreError.invalidValue}
                if let key=object["sprite"] as? String, key.range(of:"^(egg|[A-Z][0-9]{2}-(adult|baby))$",options:.regularExpression) != nil {
                    companionKey=key;companionStill=object["still"] as? Bool ?? false
                    companionView.showSprite(key,reduced:companionStill)
                }
                petStatus.title=String(line.prefix(80)); careAction.title=String(label.prefix(30))
                statusItem.button?.toolTip=petStatus.title
            case "status": result = ["warning":store.warning,"blocked":store.blocked]
            case "get":result=try store.get(object["key"] as? String ?? "") as Any? ?? NSNull()
            case "set":guard let value=object["value"] as? String else{throw StoreError.invalidValue};try store.set(object["key"] as? String ?? "",value:value)
            case "remove":try store.set(object["key"] as? String ?? "",value:nil)
            case "download":
                guard let name=object["name"] as? String,name==URL(fileURLWithPath:name).lastPathComponent,["json","png"].contains(URL(fileURLWithPath:name).pathExtension),let base64=object["base64"] as? String,let bytes=Data(base64Encoded:base64),bytes.count<=2_000_000 else{throw StoreError.invalidValue}
                let panel=NSSavePanel();panel.nameFieldStringValue=name;panel.allowedContentTypes=[name.hasSuffix(".png") ? .png : .json]
                if panel.runModal() == .OK,let url=panel.url{try bytes.write(to:url,options:.atomic)}
            default:throw StoreError.invalidValue
            }
            completionHandler(String(data:try JSONSerialization.data(withJSONObject:["value":result]),encoding:.utf8))
        }catch{completionHandler("{\"error\":\"앱 저장 또는 파일 작업을 완료하지 못했어요.\"}")}
    }
    func webView(_ webView:WKWebView,runOpenPanelWith parameters:WKOpenPanelParameters,initiatedByFrame frame:WKFrameInfo,completionHandler:@escaping([URL]?)->Void){let panel=NSOpenPanel();panel.allowedContentTypes=[.json];panel.allowsMultipleSelection=false;completionHandler(panel.runModal() == .OK ? panel.urls:nil)}
}

if CommandLine.arguments.contains("--activity-signal") {
    // Ignore stdin completely: hook payloads may contain private conversation text.
    do {
        let folder=ProcessInfo.processInfo.environment["LOREHATCH_DATA_DIR"].map{URL(fileURLWithPath:$0)} ?? FileManager.default.urls(for:.applicationSupportDirectory,in:.userDomainMask)[0].appendingPathComponent("Lorehatch")
        try FileManager.default.createDirectory(at:folder,withIntermediateDirectories:true)
        try String(Int64(Date().timeIntervalSince1970*1000)).write(to:folder.appendingPathComponent("activity-signal"),atomically:true,encoding:.utf8)
    } catch { /* Fail open, never interrupt the coding tool. */ }
    exit(0)
} else if CommandLine.arguments.contains("--self-test") {
    do {
        let folder=FileManager.default.temporaryDirectory.appendingPathComponent("lorehatch-test-\(UUID().uuidString)")
        defer{try? FileManager.default.removeItem(at:folder)}
        let key="lorehatch.v1.demo";let store=try SaveStore(folder:folder)
        try store.set(key,value:"{\"test\":1}");try store.set(key,value:"{\"test\":2}")
        guard try SaveStore(folder:folder).get(key)=="{\"test\":2}" else{throw StoreError.corrupt}
        try Data("broken".utf8).write(to:store.file)
        let recovered=try SaveStore(folder:folder)
        guard try recovered.get(key)=="{\"test\":1}",!recovered.warning.isEmpty else{throw StoreError.corrupt}
        do{try recovered.set("other",value:"{}");throw StoreError.corrupt}catch StoreError.invalidKey{}
        print("PASS: native atomic save, restart, backup recovery and key isolation")
    }catch{fputs("Native tests failed: \(error)\n",stderr);exit(1)}
} else {
    let app=NSApplication.shared;let delegate=AppDelegate();app.delegate=delegate;app.setActivationPolicy(.regular);app.run()
}
