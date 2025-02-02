import { Command } from 'commander';
import { Authenticate, Variables, state } from '@rockcarver/frodo-lib';
import * as common from '../cmd_common.js';
import { printMessage, verboseMessage } from '../../utils/Console.js';

const { getTokens } = Authenticate;
const { setDescriptionOfVariable, updateVariable } = Variables;

const program = new Command('frodo esv secret set');

program
  .description('Create secrets.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(common.verboseOption)
  .addOption(common.debugOption)
  .addOption(common.curlirizeOption)
  .requiredOption('-i, --variable-id <variable-id>', 'Variable id.')
  .option('--value [value]', 'Secret value.')
  .option('--description [description]', 'Secret description.')
  .action(
    // implement command logic inside action handler
    async (host, realm, user, password, options) => {
      state.default.session.setTenant(host);
      state.default.session.setRealm(realm);
      state.default.session.setUsername(user);
      state.default.session.setPassword(password);
      state.default.session.setDeploymentType(options.type);
      state.default.session.setAllowInsecureConnection(options.insecure);
      state.default.session.setVerbose(options.verbose);
      state.default.session.setDebug(options.debug);
      state.default.session.setCurlirize(options.curlirize);
      if (
        options.variableId &&
        options.value &&
        options.description &&
        (await getTokens())
      ) {
        verboseMessage('Updating variable...');
        updateVariable(options.variableId, options.value, options.description);
      } else if (
        options.variableId &&
        options.description &&
        (await getTokens())
      ) {
        verboseMessage('Updating variable...');
        setDescriptionOfVariable(options.variableId, options.description);
      }
      // unrecognized combination of options or no options
      else {
        printMessage(
          'Provide --variable-id and either one or both of --value and --description.'
        );
        program.help();
      }
    }
    // end command logic inside action handler
  );

program.parse();
