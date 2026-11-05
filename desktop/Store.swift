import Foundation

enum StoreError: Error { case invalidKey, invalidValue, corrupt }
final class SaveStore {
    let folder: URL
    let file: URL
    let backup: URL
    var values: [String: String] = [:]
    var warning = ""
    var blocked = false
    let keys: Set<String> = ["lorehatch.v1.normal", "lorehatch.v1.demo", "lorehatch.v1.normal.backup", "lorehatch.v1.demo.backup"]
    init(folder: URL) throws {
        self.folder = folder; file = folder.appendingPathComponent("saves.json"); backup = folder.appendingPathComponent("saves.backup.json")
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        if FileManager.default.fileExists(atPath: file.path) {
            do { values = try Self.decode(Data(contentsOf: file)) }
            catch {
                if let data = try? Data(contentsOf: backup), let recovered = try? Self.decode(data) {
                    values = recovered; warning = "앱 저장 파일이 손상되어 정상 백업을 불러왔어요."
                } else { blocked = true; warning = "앱 저장 파일을 읽지 못했어요. 원본은 보존했으니 설정에서 복구 파일을 가져오세요." }
            }
        } else if FileManager.default.fileExists(atPath: backup.path) {
            do { values = try Self.decode(Data(contentsOf: backup)); warning = "정상 백업에서 진행을 복원했어요." }
            catch { blocked = true; warning = "앱 백업 파일을 읽지 못했어요. 설정에서 복구 파일을 가져오세요." }
        }
    }
    static func decode(_ data: Data) throws -> [String: String] {
        guard data.count <= 500_000, let object = try JSONSerialization.jsonObject(with: data) as? [String: String] else { throw StoreError.corrupt }
        return object
    }
    func get(_ key: String) throws -> String? { guard keys.contains(key) else { throw StoreError.invalidKey }; return values[key] }
    func set(_ key: String, value: String?) throws {
        guard keys.contains(key) else { throw StoreError.invalidKey }
        if let value { guard value.utf8.count <= 100_000, (try? JSONSerialization.jsonObject(with: Data(value.utf8))) != nil else { throw StoreError.invalidValue } }
        var next = values; next[key] = value
        let raw = try JSONSerialization.data(withJSONObject: next, options: [.sortedKeys])
        if let previous = try? Data(contentsOf: file) {
            if (try? Self.decode(previous)) != nil { try previous.write(to: backup, options: .atomic) }
            else {
                // Keep the corrupt original even after the user explicitly imports or resets.
                let preserved = folder.appendingPathComponent("saves-damaged-\(UUID().uuidString).json")
                try previous.write(to: preserved, options: .atomic)
            }
        }
        try raw.write(to: file, options: .atomic)
        values = next; blocked = false
    }
}
