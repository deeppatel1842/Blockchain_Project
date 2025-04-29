const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const fs = require("fs");

// Canvas size
const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

async function generateChart() {
  // 🔥 Read gas_logs.txt
  const logs = fs.readFileSync("gas-logs.txt", "utf8").split("\n");
  
  let attestGas = 0;
  let claimWithProofGas = 0;
  
  logs.forEach(line => {
    if (line.startsWith("Attestation Gas:")) {
      attestGas = parseInt(line.split(":")[1].trim());
    }
    if (line.startsWith("claimWithProof Gas:")) {
      claimWithProofGas = parseInt(line.split(":")[1].trim());
    }
  });

  const configuration = {
    type: "bar",
    data: {
      labels: ["attest()", "claimWithProof()", "Coordinape", "SourceCred"],
      datasets: [
        {
          label: "Gas Usage (units)",
          data: [attestGas, claimWithProofGas, 0, 0],
          backgroundColor: [
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)"
          ]
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Gas Used"
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: "Gas Usage Comparison: DAO vs Coordinape/SourceCred"
        }
      }
    }
  };

  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync("gas_chart.png", imageBuffer);
  console.log("✅ gas_chart.png has been generated!");
}

generateChart();