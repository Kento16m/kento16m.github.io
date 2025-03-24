// データサービス - JSONBinを使用してデータをクラウドに保存
const dataService = {
  // JSONBin APIキー（無料で使用可能）
  apiKey: "$2a$10$6vZfZnzPU7STHvqoIEhj..gMjwuESMOGJI9iKo2O9QbFHMOzDPUCq",
  // JSONBin ID（作成後に更新する必要があります）
  binId: "67e1a9e8ce7767792747bc46",

  // データを取得する
  async getData(key) {
    try {
      // まずローカルストレージから取得を試みる
      const localData = localStorage.getItem(key)

      // JSONBinからデータを取得
      const response = await fetch(`https://api.jsonbin.io/v3/b/${this.binId}`, {
        method: "GET",
        headers: {
          "X-Master-Key": this.apiKey,
        },
      })

      if (!response.ok) {
        console.warn(`JSONBinからのデータ取得に失敗しました。ローカルデータを使用します。`)
        return localData ? JSON.parse(localData) : []
      }

      const result = await response.json()
      const cloudData = result.record[key] || []

      // ローカルストレージを更新
      localStorage.setItem(key, JSON.stringify(cloudData))

      return cloudData
    } catch (error) {
      console.error("データ取得エラー:", error)
      // エラーの場合はローカルデータを返す
      const localData = localStorage.getItem(key)
      return localData ? JSON.parse(localData) : []
    }
  },

  // データを保存する
  async saveData(key, data) {
    try {
      // まずローカルストレージに保存
      localStorage.setItem(key, JSON.stringify(data))

      // 現在のデータを取得
      const response = await fetch(`https://api.jsonbin.io/v3/b/${this.binId}`, {
        method: "GET",
        headers: {
          "X-Master-Key": this.apiKey,
        },
      })

      let allData = {}

      if (response.ok) {
        const result = await response.json()
        allData = result.record || {}
      }

      // 新しいデータで更新
      allData[key] = data

      // JSONBinに保存
      const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${this.binId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": this.apiKey,
        },
        body: JSON.stringify(allData),
      })

      if (!updateResponse.ok) {
        console.warn(`JSONBinへのデータ保存に失敗しました。ローカルのみに保存されました。`)
      }

      return true
    } catch (error) {
      console.error("データ保存エラー:", error)
      return false
    }
  },

  // 初期設定（最初の実行時にJSONBinを作成）
  async initialize() {
    // すでにBin IDが設定されている場合は初期化をスキップ
    if (this.binId !== "YOUR_BIN_ID_HERE") {
      return true
    }

    try {
      // ローカルデータを取得
      const inscripcionData = localStorage.getItem("inscripcionData")
      const accessData = localStorage.getItem("accessData")

      // 初期データを準備
      const initialData = {
        inscripcionData: inscripcionData ? JSON.parse(inscripcionData) : [],
        accessData: accessData ? JSON.parse(accessData) : [],
      }

      // 新しいJSONBinを作成
      const response = await fetch("https://api.jsonbin.io/v3/b", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": this.apiKey,
        },
        body: JSON.stringify(initialData),
      })

      if (!response.ok) {
        console.error("JSONBin作成に失敗しました。")
        return false
      }

      const result = await response.json()

      // Bin IDを保存
      this.binId = result.metadata.id

      // Bin IDをローカルストレージに保存
      localStorage.setItem("jsonBinId", this.binId)

      console.log("JSONBinが正常に作成されました。ID:", this.binId)
      return true
    } catch (error) {
      console.error("初期化エラー:", error)
      return false
    }
  },
}

// ローカルストレージからBin IDを読み込む
const savedBinId = localStorage.getItem("jsonBinId")
if (savedBinId) {
  dataService.binId = savedBinId
}

// 初期化を実行
dataService.initialize()

