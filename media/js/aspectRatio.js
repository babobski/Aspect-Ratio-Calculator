const vscode = acquireVsCodeApi();
var AspectRatio = {
    init: () => {
        document.getElementById('width').focus();
        document.getElementById('get_result').addEventListener('click', AspectRatio.calculate);
        document.getElementById('width').addEventListener('keypress', AspectRatio.handleKeyPress);
        document.getElementById('height').addEventListener('keypress', AspectRatio.handleKeyPress);
    },
    calculate: () => {
        let output = document.getElementById('result'),
            breedte = document.getElementById('width').value,
            hoogte = document.getElementById('height').value;

        if (breedte.length > 0 && hoogte.length > 0) {
            var padding = hoogte / (  breedte / 100 ),
                val = (Number.isSafeInteger(padding) ? padding : padding.toFixed(3)) + '%';
            output.innerHTML = val;

            vscode.postMessage({
                command: 'copy_result',
                text: val
            });
        }
    },
    handleKeyPress: (event) => {
        if (event.keyCode === 13) {
            AspectRatio.calculate();
        }
    }
};

window.addEventListener('DOMContentLoaded', AspectRatio.init);