let questions = [];
let currentQuestion = 0;
let score = 0;
let selectedAnswers = [];

async function fetchQuestions(amount = 5) {
    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=${amount}&category=22&type=multiple`);
        const data = await response.json();
        
        if (data.response_code === 0) {
            return data.results.map(q => ({
                question: q.question,
                options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
                correctAnswer: q.correct_answer
            }));
        } else {
            throw new Error('Failed to fetch questions');
        }
    } catch (error) {
        throw error;
    }
}

async function startQuiz() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    try {
        questions = await fetchQuestions();
        selectedAnswers = new Array(questions.length).fill(null);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('quiz-screen').style.display = 'block';
        loadQuestion();
    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').textContent = 'Failed to load questions. Please try again.';
        document.getElementById('error').style.display = 'block';
    }
}

function loadQuestion() {
    const question = questions[currentQuestion];
    document.getElementById('question-number').textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    document.getElementById('question').innerHTML = question.question;
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerHTML = option;
        button.onclick = () => selectOption(option);
        if (selectedAnswers[currentQuestion] === option) {
            button.style.backgroundColor = '#c62828';
        }
        optionsContainer.appendChild(button);
    });
    document.getElementById('submit-btn').disabled = !selectedAnswers[currentQuestion];
    document.getElementById('prev-btn').disabled = currentQuestion === 0;
}

function selectOption(option) {
    selectedAnswers[currentQuestion] = option;
    document.getElementById('submit-btn').disabled = false;
    const buttons = document.querySelectorAll('#options button');
    buttons.forEach(button => {
        button.style.backgroundColor = button.innerHTML === option ? '#c62828' : '#eb4034';
    });
}

function submitAnswer() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        loadQuestion();
    } else {
        calculateScore();
        showResult();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

function calculateScore() {
    score = questions.reduce((total, question, index) => {
        return total + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
}

function showResult() {
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('score').textContent = `Your score: ${score} out of ${questions.length}`;
    let message = '';
    if (score === questions.length) {
        message = "Perfect score! You're an expert!";
    } else if (score > questions.length / 2) {
        message = "Great job! You know well!";
    } else {
        message = "Keep learning. You can do better!";
    }
    document.getElementById('message').textContent = message;
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    selectedAnswers = [];
    questions = [];
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'block';
}