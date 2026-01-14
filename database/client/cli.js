import readline from 'readline';
import chalk from 'chalk';

export class ClientCLI {
  constructor(onInput) {
    this.onInput = onInput;
    this.rl = null;
  }

  start() {
    // Terminal yüksekliği kadar boş satır ekleyerek temiz görünüm sağla
    const terminalHeight = process.stdout.rows || 30;
    console.log('\n'.repeat(terminalHeight));
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.cyan('> ')
    });

    console.log(chalk.green('✓ Client CLI started. Type your commands:'));
    this.rl.prompt();

    this.rl.on('line', (input) => {
      const command = input.trim();
      
      if (command) {
        // Kullanıcı girdisini callback ile geri döndür
        this.onInput(command);
      }
      
      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log(chalk.yellow('\n✓ Exiting...'));
      process.exit(0);
    });
  }

  stop() {
    if (this.rl) {
      this.rl.close();
    }
  }
}
