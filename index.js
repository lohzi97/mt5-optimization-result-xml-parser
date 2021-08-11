//------------------------------------------------------
// required module
//------------------------------------------------------
const fsp = require('fs').promises;
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;

//------------------------------------------------------
// filename that will be processed
//------------------------------------------------------
const FILES_TO_PROCESS = [
  "AUDUSD_backtest.xml", "AUDUSD_forwardtest.xml", 
  "EURUSD_backtest.xml", "EURUSD_forwardtest.xml", 
  "USDCAD_backtest.xml", "USDCAD_forwardtest.xml", 
  "USDCHF_backtest.xml", "USDCHF_forwardtest.xml", 
  "USDJPY_backtest.xml", "USDJPY_forwardtest.xml", 
  "GBPUSD_backtest.xml", "GBPUSD_forwardtest.xml", 
  "AUDCAD_backtest.xml", "AUDCAD_forwardtest.xml", 
  "AUDCHF_backtest.xml", "AUDCHF_forwardtest.xml", 
  "AUDNZD_backtest.xml", "AUDNZD_forwardtest.xml", 
  "EURAUD_backtest.xml", "EURAUD_forwardtest.xml", 
  "AUDSGD_backtest.xml", "AUDSGD_forwardtest.xml", 
  "EURCHF_backtest.xml", "EURCHF_forwardtest.xml", 
  "NZDUSD_backtest.xml", "NZDUSD_forwardtest.xml", 
  "EURGBP_backtest.xml", "EURGBP_forwardtest.xml", 
  "GBPAUD_backtest.xml", "GBPAUD_forwardtest.xml", 
  "GBPCHF_backtest.xml", "GBPCHF_forwardtest.xml", 
  "EURCAD_backtest.xml", "EURCAD_forwardtest.xml", 
  "EURJPY_backtest.xml", "EURJPY_forwardtest.xml", 
  "EURNZD_backtest.xml", "EURNZD_forwardtest.xml", 
  "AUDJPY_backtest.xml", "AUDJPY_forwardtest.xml", 
  "CADJPY_backtest.xml", "CADJPY_forwardtest.xml", 
  "CHFJPY_backtest.xml", "CHFJPY_forwardtest.xml", 
  "GBPJPY_backtest.xml", "GBPJPY_forwardtest.xml", 
  "NZDJPY_backtest.xml", "NZDJPY_forwardtest.xml", 
  "GBPCAD_backtest.xml", "GBPCAD_forwardtest.xml", 
  "GBPNZD_backtest.xml", "GBPNZD_forwardtest.xml", 
  "CADCHF_backtest.xml", "CADCHF_forwardtest.xml", 
  "EURSGD_backtest.xml", "EURSGD_forwardtest.xml", 
  "USDSGD_backtest.xml", "USDSGD_forwardtest.xml", 
  "SGDJPY_backtest.xml", "SGDJPY_forwardtest.xml", 
  "GBPSGD_backtest.xml", "GBPSGD_forwardtest.xml", 
  "NZDCHF_backtest.xml", "NZDCHF_forwardtest.xml", 
  "NZDCAD_backtest.xml", "NZDCAD_forwardtest.xml", 
  "CHFSGD_backtest.xml", "CHFSGD_forwardtest.xml"
];
//------------------------------------------------------
// Get the parameter that has been passed when running this main script.
const args = process.argv.slice(2);

//------------------------------------------------------
// Run main function
main(args);

async function main(args) {

  // verify the parameter
  // - the parameter should be a path to the folder that contain all the 
  //   optimization result xml files.
  // - it should have exactly one parameter
  if (args.length != 1) {
    console.error(`Please provide path to the folder that contain all the optimization result xml files.`);
    return;
  } 
  
  try {

    const folderPath = args[0];

    // Get the files in the follder
    const files = await fsp.readdir(folderPath);

    // Find and print out all the files that it will process.
    let filesToProcess = [];
    for (const file of files) {
      if (FILES_TO_PROCESS.includes(file)) {
        filesToProcess.push(file);
      }
    }
    if (filesToProcess.length > 0) {
      console.info(`Found ${filesToProcess.length} files in the folder:`);
      for (const file of filesToProcess) {
        console.info(`- ${file}`);
      }
    } else {
      console.error(`No file match with the defined filename.`);
      return;
    }

    // Read the file and convert them to csv file.
    let processFilePromises = [];
    for (const fileToProcess of filesToProcess) {
      
      processFilePromises.push(( async _ => {
        
        let filePath = folderPath + '\\' + fileToProcess;

        let fileContent = await fsp.readFile(filePath, "utf8");

        const $ = cheerio.load(fileContent, {
          'xmlMode': true
        });

        let header = [];
        let rows = [];

        $('Table > Row').each((rowIndex, rowElement) => {

          let datas = [];
          
          $('Data', rowElement).toArray().map(dataElement => {
            
            if (rowIndex === 0) {
              header.push($(dataElement).text());
            } else {
              datas.push($(dataElement).text());
            }
            
          });

          if (datas.length > 0) {
            rows.push(datas);
          }

        });

        let csvFilename = fileToProcess.split('.')[0] + '.csv';
        
        const csvWriter = createCsvWriter({
          'header': header,
          'path': folderPath + '\\' + csvFilename
        });

        await csvWriter.writeRecords(rows);

      })());

    }
    
    await Promise.all(processFilePromises);

    console.log(`Done`);
    
  } catch (error) {
    console.error(`Error: ${error}`);
  }
    
}