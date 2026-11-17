import Cocoa

func moamonLocale() -> String { (UserDefaults.standard.string(forKey:"moamonLanguage") ?? Locale.preferredLanguages.first ?? "en").hasPrefix("ko") ? "ko" : "en" }
let moamonTranslations: [String:String] = [
"집중 시작":"Start focus",
"집중 중":"Focus running",
"집중 멈추기":"Pause focus",
"돌보고 반응 보기":"Care and reactions",
"정원 열기":"Open garden",
"작게 보기":"Small pet",
"크게 보기":"Large pet",
"펫 숨기기":"Hide pet",
"클릭해 집중 시작·정지 · 오른쪽 클릭으로 메뉴 · 두 번 클릭해 정원":"Click to start or pause focus · right-click for menu · double-click for garden",
"화면에 펫 띄우기":"Show desktop pet",
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
"로컬 저장으로 키우는 작은 도트 펫 정원\n바탕화면 펫과 메뉴바에서 집중을 시작하거나 멈출 수 있어요.":"A pixel pet garden with local saves.\nStart or pause focus from your desktop pet or the menu bar."
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
    var toggleFocus: (() -> Void)?
    var focusing = false {
        didSet { if focusing != oldValue { needsDisplay = true } }
    }
    var openGarden: (() -> Void)?
    var care: (() -> Void)?
    var hidePet: (() -> Void)?
    var moved: (() -> Void)?
    var resizePet: ((CGFloat) -> Void)?
    private var dragStart = NSPoint.zero
    private var origin = NSPoint.zero
    private var dragged = false
    private var affectionIndex = 0
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
        else if event.clickCount == 1 { perform(#selector(focusNow),with:nil,afterDelay:NSEvent.doubleClickInterval) }
    }
    override func rightMouseDown(with event: NSEvent) {
        NSObject.cancelPreviousPerformRequests(withTarget: self)
        showActions()
    }
    @objc private func focusNow() { celebrate(); toggleFocus?() }
    @objc private func showActions() {
        let menu=NSMenu()
        for (title,action) in [(L(focusing ? "집중 멈추기" : "집중 시작"),#selector(focusNow)),(L("돌보고 반응 보기"),#selector(careNow)),(L("정원 열기"),#selector(garden)),(L("작게 보기"),#selector(small)),(L("크게 보기"),#selector(large)),(L("펫 숨기기"),#selector(hide))] {
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
        affectionIndex=(affectionIndex+1)%3
        happyUntil=Date().addingTimeInterval(2);needsDisplay=true
        DispatchQueue.main.asyncAfter(deadline:.now()+2.1){[weak self] in self?.needsDisplay=true }
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
            timer=Timer.scheduledTimer(withTimeInterval:0.12,repeats:true){[weak self] _ in
                guard let self else{return};self.ticks+=1;self.frameIndex=(self.ticks/7)%2;self.needsDisplay=true
            }
        }
    }
    override func draw(_ dirtyRect: NSRect) {
        NSColor.clear.setFill(); dirtyRect.fill(using:.copy)
        guard frames.indices.contains(frameIndex) else{return}
        NSGraphicsContext.current?.shouldAntialias=false
        let scale=bounds.width/36
        let happy=Date()<happyUntil
        // Quantized pixel offsets keep the sprite crisp; quiet cycles leave long rests.
        let cycle=ticks % 160
        var lift: CGFloat=0, lean: CGFloat=0, squash: CGFloat=1
        if !reducedMotion {
            if happy {
                let beat=ticks % 8
                if affectionIndex==0 { lift = beat<4 ? 2*scale : 0 }
                else if affectionIndex==1 { lean = beat<4 ? scale : -scale }
                else { squash = beat<4 ? 0.94 : 1; lift=beat<4 ? 0 : scale }
            } else if focusing {
                // A small working nod, once every few seconds.
                squash = ticks % 32 < 3 ? 0.97 : 1
            } else if cycle>=110 && cycle<124 {
                lean = cycle<117 ? scale : -scale
            } else if cycle>=145 {
                squash=0.94
            } else {
                lift = ticks % 24 < 6 ? scale : 0
            }
        }
        for (p,color) in frames[frameIndex].pixels {
            color.setFill();NSRect(x:(p.minX+2)*scale+lean,y:(p.minY*squash+1)*scale+lift,width:p.width*scale,height:p.height*scale*squash).fill()
        }
        if focusing && !happy {
            let offset: CGFloat = !reducedMotion && frameIndex == 1 ? 1 : 0
            NSColor(srgbRed: 0.13, green: 0.26, blue: 0.22, alpha: 1).setFill()
            NSRect(x: 25*scale, y: 27*scale, width: 10*scale, height: 8*scale).fill()
            NSColor(srgbRed: 0.65, green: 0.88, blue: 0.54, alpha: 1).setFill()
            for index in 0..<3 {
                let y: CGFloat = index == frameIndex ? 30 + offset : 30
                NSRect(x: CGFloat(26 + index*3)*scale, y: y*scale, width: 2*scale, height: 2*scale).fill()
            }
        } else if happy {
            NSColor.systemPink.setFill()
            for p in [NSRect(x:27,y:29,width:2,height:2),NSRect(x:30,y:29,width:2,height:2),NSRect(x:28,y:27,width:3,height:2),NSRect(x:29,y:26,width:1,height:1)] {
                NSRect(x:p.minX*scale,y:p.minY*scale,width:p.width*scale,height:p.height*scale).fill()
            }
        } else if ticks % 160 >= 145 && !reducedMotion {
            let attrs:[NSAttributedString.Key:Any]=[.font:NSFont.monospacedSystemFont(ofSize:12,weight:.medium),.foregroundColor:NSColor.secondaryLabelColor]
            ("z" as NSString).draw(at:NSPoint(x:bounds.width-18,y:bounds.height-20),withAttributes:attrs)
        }
    }
}
