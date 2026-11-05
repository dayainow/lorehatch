import Cocoa

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
        for (title,action) in [("돌보고 반응 보기",#selector(careNow)),("정원 열기",#selector(garden)),("작게 보기",#selector(small)),("크게 보기",#selector(large)),("펫 숨기기",#selector(hide))] {
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
