import Cocoa

func moamonLocale() -> String { (UserDefaults.standard.string(forKey:"moamonLanguage") ?? Locale.preferredLanguages.first ?? "en").hasPrefix("ko") ? "ko" : "en" }
let moamonTranslations: [String:String] = [
"돌보고 반응 보기":"Care and reactions",
"정원 열기":"Open garden",
"작게 보기":"Small companion",
"크게 보기":"Large companion",
"펫 숨기기":"Hide companion",
"클릭해 돌보기 · 끌어서 이동 · 두 번 클릭해 정원 열기":"Click for care · drag to move · double-click for garden",
"화면에 펫 띄우기":"Show desktop companion",
"정원이 이미 실행 중이에요. 메뉴바에서 정원을 열어주세요.":"The garden is already running. Open it from the menu bar.",
"정원을 열지 못했어요":"Could not open the garden",
"모아몬":"Moamon",
"모아몬에 관하여":"About Moamon",
"모아몬 숨기기":"Hide Moamon",
"모아몬 종료":"Quit Moamon",
"편집":"Edit",
"실행 취소":"Undo",
"잘라내기":"Cut",
"복사":"Copy",
"붙여넣기":"Paste",
"전체 선택":"Select All",
"알을 고를 준비가 됐어요":"Ready to choose an egg",
"첫 알 고르기":"Choose your first egg",
"항상 위에 표시":"Keep on top",
"저장 폴더 열기":"Open save folder",
"종료":"Quit",
"계속하기":"Continue",
"취소":"Cancel",
"모아몬 0.7.0":"Moamon 0.7.0",
"로컬 저장으로 키우는 작은 도트 펫 정원\n앱 창이 보일 때 함께한 시간을 반영해요.\n메뉴바에서 다시 열거나 항상 위에 둘 수 있어요.":"A local-first pixel companion garden.\nTime counts while the garden is visible.\nUse the menu bar to reopen it or keep it on top."
]
func L(_ text:String) -> String { moamonLocale()=="en" ? (moamonTranslations[text] ?? text) : text }
func localizeMenu(_ menu:NSMenu?) {
 guard let menu else{return}
 for item in menu.items {
  let original=moamonTranslations.first(where:{$0.value==item.title})?.key ?? item.title
  item.title=L(original);localizeMenu(item.submenu)
 }
}


// Render the bundled 32-pixel rectangle sprites without a second web view.
private final class PixelArt: NSObject, XMLParserDelegate {
    var pixels: [(NSRect, NSColor)] = []
    func parser(_ parser: XMLParser, didStartElement elementName: String,
                namespaceURI: String?, qualifiedName: String?, attributes a: [String:String]) {
        guard elementName == "rect", let x = Double(a["x"] ?? ""), let y = Double(a["y"] ?? ""),
              let w = Double(a["width"] ?? ""), let h = Double(a["height"] ?? ""),
              let hex = a["fill"], let rgb = Int(hex.dropFirst(), radix:16) else { return }
        let color = NSColor(srgbRed: CGFloat(rgb >> 16)/255, green: CGFloat((rgb >> 8)&255)/255,
                            blue: CGFloat(rgb&255)/255, alpha:1)
        pixels.append((NSRect(x:x,y:32-y-h,width:w,height:h),color))
    }
}

final class CompanionView: NSView {
    var openGarden: (() -> Void)?
    var care: (() -> Void)?
    var hidePet: (() -> Void)?
    var moved: (() -> Void)?
    var resizePet: ((CGFloat) -> Void)?
    private var dragStart = NSPoint.zero
    private var origin = NSPoint.zero
    private var dragged = false
    private var happyUntil = Date.distantPast
    private var reducedMotion = false
    private var ticks = 0
    private var frames: [PixelArt] = []
    private var frameIndex = 0
    private var current = ""
    private var timer: Timer?
    override var mouseDownCanMoveWindow: Bool { false }
    override func mouseDown(with event: NSEvent) {
        dragStart=NSEvent.mouseLocation;origin=window?.frame.origin ?? .zero;dragged=false
        if event.clickCount == 2 { NSObject.cancelPreviousPerformRequests(withTarget:self);openGarden?() }
    }
    override func mouseDragged(with event: NSEvent) {
        let point=NSEvent.mouseLocation
        if hypot(point.x-dragStart.x,point.y-dragStart.y)>4 { dragged=true }
        if dragged { window?.setFrameOrigin(NSPoint(x:origin.x+point.x-dragStart.x,y:origin.y+point.y-dragStart.y)) }
    }
    override func mouseUp(with event: NSEvent) {
        if dragged { moved?() }
        else if event.clickCount == 1 { perform(#selector(showActions),with:nil,afterDelay:NSEvent.doubleClickInterval) }
    }
    override func rightMouseDown(with event: NSEvent) { showActions() }
    @objc private func showActions() {
        let menu=NSMenu()
        for (title,action) in [(L("돌보고 반응 보기"),#selector(careNow)),(L("정원 열기"),#selector(garden)),(L("작게 보기"),#selector(small)),(L("크게 보기"),#selector(large)),(L("펫 숨기기"),#selector(hide))] {
            let item=NSMenuItem(title:title,action:action,keyEquivalent:"");item.target=self;menu.addItem(item)
        }
        menu.popUp(positioning:nil,at:NSPoint(x:bounds.midX,y:bounds.midY),in:self)
    }
    @objc private func careNow(){ care?() }
    @objc private func garden(){ openGarden?() }
    @objc private func small(){ resizePet?(96) }
    @objc private func large(){ resizePet?(144) }
    @objc private func hide(){ hidePet?() }
    func celebrate(){
        happyUntil=Date().addingTimeInterval(3);needsDisplay=true
        DispatchQueue.main.asyncAfter(deadline:.now()+3.1){[weak self] in self?.needsDisplay=true }
    }
    func showSprite(_ key: String, reduced: Bool) {
        if key != current, let folder = Bundle.main.resourceURL?.appendingPathComponent("site/assets/sprites") {
            let loaded: [PixelArt] = (0...1).compactMap { index in
                guard let parser=XMLParser(contentsOf:folder.appendingPathComponent("\(key)-\(index).svg")) else { return nil }
                let art=PixelArt(); parser.delegate=art
                return parser.parse() && !art.pixels.isEmpty ? art : nil
            }
            if loaded.count == 2 { current=key; frames=loaded; frameIndex=0; needsDisplay=true }
        }
        reducedMotion=reduced
        if reduced || window?.isVisible != true {
            timer?.invalidate();timer=nil;frameIndex=0;needsDisplay=true
        } else if timer == nil {
            timer=Timer.scheduledTimer(withTimeInterval:0.85,repeats:true){[weak self] _ in
                guard let self else{return};self.frameIndex=1-self.frameIndex;self.ticks+=1;self.needsDisplay=true
            }
        }
    }
    override func draw(_ dirtyRect: NSRect) {
        NSColor.clear.setFill(); dirtyRect.fill(using:.copy)
        guard frames.indices.contains(frameIndex) else{return}
        NSGraphicsContext.current?.shouldAntialias=false
        let scale=bounds.width/36
        let happy=Date()<happyUntil
        let lift=happy && !reducedMotion && frameIndex==1 ? scale : 0
        for (p,color) in frames[frameIndex].pixels {
            color.setFill();NSRect(x:(p.minX+2)*scale,y:(p.minY+1)*scale+lift,width:p.width*scale,height:p.height*scale).fill()
        }
        if happy {
            NSColor.systemPink.setFill()
            for p in [NSRect(x:27,y:29,width:2,height:2),NSRect(x:30,y:29,width:2,height:2),NSRect(x:28,y:27,width:3,height:2),NSRect(x:29,y:26,width:1,height:1)] {
                NSRect(x:p.minX*scale,y:p.minY*scale,width:p.width*scale,height:p.height*scale).fill()
            }
        } else if ticks % 24 >= 20 && !reducedMotion {
            let attrs:[NSAttributedString.Key:Any]=[.font:NSFont.monospacedSystemFont(ofSize:12,weight:.medium),.foregroundColor:NSColor.secondaryLabelColor]
            ("z" as NSString).draw(at:NSPoint(x:bounds.width-18,y:bounds.height-20),withAttributes:attrs)
        }
    }
}
