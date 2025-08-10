// bcnw_construct_a_sec.js

const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
const inquirer = require('inquirer');
const bcrypt = require('bcrypt');

const toolGenerator = {
  async generateTool() {
    const questions = [
      {
        type: 'input',
        name: 'toolName',
        message: 'Enter the name of your CLI tool:',
      },
      {
        type: 'input',
        name: 'toolDescription',
        message: 'Enter a brief description of your CLI tool:',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter a password to secure your tool:',
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirm generation of CLI tool:',
      },
    ];

    const answers = await inquirer.prompt(questions);

    if (!answers.confirm) {
      console.error('Tool generation cancelled.');
      return;
    }

    const toolDir = path.join(__dirname, answers.toolName);
    const toolFile = path.join(toolDir, `${answers.toolName}.js`);

    fs.mkdirSync(toolDir);

    const hash = await bcrypt.hash(answers.password, 10);

    const toolContent = `
      #!/usr/bin/env node
      const crypto = require('crypto');

      const passwordHash = '${hash}';
      const toolDescription = '${answers.toolDescription}';

      const authenticate = (password) => {
        const hash = crypto.createHash('sha256');
        hash.update(password);
        const hashedPassword = hash.digest('hex');
        return hashedPassword === passwordHash;
      };

      if (!process.argv[2] || !authenticate(process.argv[2])) {
        console.error('Authentication failed.');
        process.exit(1);
      }

      console.log(toolDescription);
    `;

    fs.writeFileSync(toolFile, toolContent);

    shelljs.chmod('755', toolFile);

    console.log(`CLI tool generated successfully at ${toolFile}`);
  },
};

toolGenerator.generateTool();