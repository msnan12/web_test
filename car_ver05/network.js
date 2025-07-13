// ニューラルネットワークのクラス
class NeuralNetwork{
    constructor(neuronCounts){
        this.levels=[]; // 各層（レイヤー）を格納する配列

        // 各層を初期化
        for(let i=0;i<neuronCounts.length-1;i++){
            this.levels.push(new Level(
                neuronCounts[i],neuronCounts[i+1]
            ));
        }
    }

    // フィードフォワード（順伝播）の処理
    static feedForward(givenInputs, network){
        let outputs = Level.feedForward(
            givenInputs, network.levels[0]); // 最初のレイヤーの出力を計算

        // 順に各レイヤーにデータを流し、出力を更新
        for(let i=1; i<network.levels.length; i++){
            outputs = Level.feedForward(
                outputs, network.levels[i]);
        }

        return outputs; // 最終的な出力を返す
    }

    static mutate(network,amount=1){
        network.levels.forEach(level => {
            for(let i=0;i<level.biases.length;i++){
                level.biases[i]=lerp(
                    level.biases[i],
                    Math.random()*2-1,
                    amount
                );
            }
            for(let i=0;i<level.weights.length;i++){
                for(let j=0;j<level.weights[i].length;j++){
                    level.weights[i][j]=lerp(
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount
                    );
                }
            }
        });
    }
}


// ニューラルネットワークのレイヤー（層）のクラス
class Level{
    constructor(inputCount, outputCount){
        this.inputs = new Array(inputCount);  // 入力ノード
        this.outputs = new Array(outputCount); // 出力ノード
        this.biases = new Array(outputCount); // バイアス値

        this.weights = []; // 入力と出力間の重み
        for(let i=0; i<inputCount; i++){
            this.weights[i] = new Array(outputCount);
        }

        Level.#randomize(this); // 重みとバイアスをランダムに初期化
    }

    // 重みとバイアスのランダム化
    static #randomize(level){
        for(let i=0; i<level.inputs.length; i++){
            for(let j=0; j<level.outputs.length; j++){
                level.weights[i][j] = Math.random() * 2 - 1; // -1~1の範囲でランダムな値を設定
            }
        }

        for(let i=0; i<level.biases.length; i++){
            level.biases[i] = Math.random() * 2 - 1; // -1~1の範囲でランダムな値を設定
        }
    }

    // フィードフォワード（順伝播）の処理
    static feedForward(givenInputs, level){
        for(let i=0; i<level.inputs.length; i++){
            level.inputs[i] = givenInputs[i]; // 入力値をセット
        }

        for(let i=0; i<level.outputs.length; i++){
            let sum = 0;
            
            // 各入力とその重みの積の合計を計算
            for(let j=0; j<level.inputs.length; j++){
                sum += level.inputs[j] * level.weights[j][i]; // 注意: weightの参照を修正
            }

            // 活性化関数（ステップ関数）による出力の決定
            if(sum > level.biases[i]){
                level.outputs[i] = 1; // 活性化閾値を超えた場合、1を出力
            }else{
                level.outputs[i] = 0; // それ以外は0を出力
            }
            // const activation = sum + level.biases[i];  // 通常はバイアスを加算
            // level.outputs[i] = sigmoid(activation);
        }    

        return level.outputs; // 計算された出力を返す
    }
}


