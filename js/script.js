const display = document.getElementById('display');
const buttons = document.querySelector('.buttons');
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = true;
let lastOperator = null;
let lastOperand = null;

function formatResult(value) {
    if (!Number.isFinite(value)) return 'Error';
    return String(Number(value.toPrecision(12)));
}

function showResult(value) {
    display.value = formatResult(value);
}

function applyOperation(first, operator, second) {
    switch (operator) {
        case '+':
            return first + second;
        case '-':
            return first - second;
        case '*':
            return first * second;
        case '/':
            return second === 0 ? NaN : first / second;
        default:
            return second;
    }
}

function inputDigit(digit) {
    if (display.value === 'Error' || waitingForOperand) {
        display.value = digit;
        waitingForOperand = false;
    } else if (display.value === '0') {
        display.value = digit;
    } else {
        display.value += digit;
    }
    lastOperator = null;
}

function inputDecimal() {
    if (display.value === 'Error' || waitingForOperand) {
        display.value = '0.';
        waitingForOperand = false;
    } else if (!display.value.includes('.')) {
        display.value += '.';
    }
    lastOperator = null;
}

function chooseOperator(operator) {
    const currentValue = Number(display.value);

    if (display.value === 'Error') return;
    if (pendingOperator && !waitingForOperand) {
        const result = applyOperation(storedValue, pendingOperator, currentValue);
        showResult(result);
        storedValue = result;
    } else if (storedValue === null || !pendingOperator) {
        storedValue = currentValue;
    }

    pendingOperator = operator;
    waitingForOperand = true;
    lastOperator = null;
}

function calculate() {
    if (pendingOperator) {
        const secondValue = Number(display.value);
        const result = applyOperation(storedValue, pendingOperator, secondValue);
        showResult(result);
        lastOperator = pendingOperator;
        lastOperand = secondValue;
        storedValue = Number.isFinite(result) ? result : null;
        pendingOperator = null;
        waitingForOperand = true;
    } else if (lastOperator && lastOperand !== null && display.value !== 'Error') {
        const result = applyOperation(Number(display.value), lastOperator, lastOperand);
        showResult(result);
        storedValue = Number.isFinite(result) ? result : null;
        waitingForOperand = true;
    }
}

function clearCalculator() {
    display.value = '0';
    storedValue = null;
    pendingOperator = null;
    waitingForOperand = true;
    lastOperator = null;
    lastOperand = null;
}

function backspace() {
    if (display.value === 'Error' || waitingForOperand) return;
    const shortened = display.value.slice(0, -1);
    display.value = shortened === '' || shortened === '-' ? '0' : shortened;
    if (display.value === '0') waitingForOperand = true;
}

function changeSign() {
    if (display.value === 'Error') return;
    display.value = formatResult(-Number(display.value));
    lastOperator = null;
}

function percentage() {
    if (display.value === 'Error') return;
    const currentValue = Number(display.value);
    const percentageValue = pendingOperator === '+' || pendingOperator === '-'
        ? storedValue * currentValue / 100
        : currentValue / 100;
    display.value = formatResult(percentageValue);
    waitingForOperand = true;
    lastOperator = null;
}

function handleAction(action, value) {
    if (value !== undefined) {
        if (/^\d$/.test(value)) inputDigit(value);
        else chooseOperator(value);
        return;
    }

    switch (action) {
        case 'clear': clearCalculator(); break;
        case 'backspace': backspace(); break;
        case 'decimal': inputDecimal(); break;
        case 'sign': changeSign(); break;
        case 'percent': percentage(); break;
        case 'equals': calculate(); break;
    }
}

buttons.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button && buttons.contains(button)) {
        handleAction(button.dataset.action, button.dataset.value);
    }
});

document.addEventListener('keydown', event => {
    if (/^\d$/.test(event.key)) handleAction(undefined, event.key);
    else if (['+', '-', '*', '/'].includes(event.key)) handleAction(undefined, event.key);
    else if (event.key === '.') handleAction('decimal');
    else if (event.key === 'Enter' || event.key === '=') handleAction('equals');
    else if (event.key === 'Backspace') handleAction('backspace');
    else if (event.key === 'Escape' || event.key === 'Delete') handleAction('clear');
    else if (event.key === '%') handleAction('percent');
    else return;
    event.preventDefault();
});