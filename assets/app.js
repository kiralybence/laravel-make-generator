let model = '';

const eols = {
    cmd: {
        separator: ' && ',
        new_line: '^\n', // TODO: this sometimes doesn't work, cmd asks "More?"
    },
    powershell: {
        separator: '; ',
        new_line: '`\n',
    },
    bash: {
        separator: ' && ',
        new_line: '\\\n',
    },
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function pluralize(str) {
    return str.substr(str.length - 1) === 'y'
        ? str.slice(0, -1) + 'ies'
        : str + 's';
}

function onModelChange(val) {
    model = capitalize(val.trim());
    document.querySelector('#modelInput').value = model;
    printCommand();
}

function getShell() {
    let inputs = document.querySelectorAll('input[name="shell"]');
    
    for (const input of inputs) {
        if (input.checked) {
            return input.value;
        }
    }
}

function getFormat() {
    let inputs = document.querySelectorAll('input[name="format"]');
    
    for (const input of inputs) {
        if (input.checked) {
            return input.value;
        }
    }
}

function getEol() {
    let eol = eols[getShell()].separator;

    if (getFormat() === 'multiline') {
        eol += ' ' + eols[getShell()].new_line;
    }

    return eol;
}

function printCommand() {
    if (!model) {
        document.querySelector('#commandContainer').textContent = '';
        return;
    }

    let command = '';
    let eol = getEol();

    if (document.querySelector('#modelCheckbox').checked) {
        command += `php artisan make:model ${model}${eol}`;
    }

    if (document.querySelector('#controllerCheckbox').checked) {
        command += `php artisan make:controller ${model}Controller${eol}`;

        if (document.querySelector('#apiCheckbox').checked) {
            command += `php artisan make:controller Api/${model}Controller${eol}`;
        }
    }

    if (document.querySelector('#requestCheckbox').checked) {
        command += `php artisan make:request ${model}/IndexRequest${eol}`;
        command += `php artisan make:request ${model}/ShowRequest${eol}`;
        command += `php artisan make:request ${model}/CreateRequest${eol}`;
        command += `php artisan make:request ${model}/EditRequest${eol}`;
    
        if (document.querySelector('#apiCheckbox').checked) {
            command += `php artisan make:request ${model}/Api/IndexRequest${eol}`;
            command += `php artisan make:request ${model}/Api/ShowRequest${eol}`;
            command += `php artisan make:request ${model}/Api/StoreRequest${eol}`;
            command += `php artisan make:request ${model}/Api/UpdateRequest${eol}`;
            command += `php artisan make:request ${model}/Api/DestroyRequest${eol}`;
        } else {
            command += `php artisan make:request ${model}/StoreRequest${eol}`;
            command += `php artisan make:request ${model}/UpdateRequest${eol}`;
            command += `php artisan make:request ${model}/DestroyRequest${eol}`;
        }
    }

    if (document.querySelector('#factoryCheckbox').checked) {
        command += `php artisan make:factory ${model}Factory${eol}`;
    }

    if (document.querySelector('#testCheckbox').checked) {
        command += `php artisan make:test ${model}/IndexTest${eol}`;
        command += `php artisan make:test ${model}/ShowTest${eol}`;
        command += `php artisan make:test ${model}/CreateTest${eol}`;
        command += `php artisan make:test ${model}/StoreTest${eol}`;
        command += `php artisan make:test ${model}/EditTest${eol}`;
        command += `php artisan make:test ${model}/UpdateTest${eol}`;
        command += `php artisan make:test ${model}/DestroyTest${eol}`;
    }

    if (document.querySelector('#migrationCheckbox').checked) {
        command += `php artisan make:migration create_${pluralize(model.toLowerCase())}_table${eol}`;
    }

    if (document.querySelector('#seederCheckbox').checked) {
        command += `php artisan make:seeder ${model}Seeder${eol}`;
    }

    if (document.querySelector('#serviceCheckbox').checked) {
        switch (getShell()) {
            case 'cmd':
                command += `if not exist "app/Services/" mkdir "app/Services"${eol}`;
                break;

            case 'powershell':
                command += `md -Force "app/Services" >$null${eol}`;
                break;

            case 'bash':
                command += `mkdir -p "app/Services"${eol}`;
                break;

            default:
                break;
        }
        
        command += `echo "<?php\\n\\nnamespace App\\Services;\\n\\nclass ${model}Service\\n{\\n    //\\n}\\n" >> app/Services/${model}Service.php${eol}`;
    }
    
    command = command.slice(0, -(eol.length)); // to remove the last "end of line"
    
    document.querySelector('#commandContainer').textContent = command;
}

document.querySelectorAll('#modelInput').forEach(el => {
    el.addEventListener('input', e => {
        onModelChange(el.value);
    });
});

document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(el => {
    el.addEventListener('change', e => {
        printCommand();
    });
});