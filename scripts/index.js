const container = document.getElementById("container");
const overlayBlock = document.querySelector(".overlay");
const mobileScreenWidth = 768;
const canvas = document.getElementById("canvas");
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
const centerX = windowWidth / 2;
const centerY = windowHeight / 2;

const widthBorder = 2;
const codeButtonAnimateControl = 83;
const codeButtonRefreshAnimate = 82;
let startRadius = 70;
let indentX = 35;
let indentY = 10;
let speed = 6;
let maxRadiusSmallestBall = startRadius;
let isActiveAnimation = false;

const colors = {
    yellow: "#FFD700",
    blue: "#0057B8",
    red: "#ff0000",
};

canvas.width = windowWidth;
canvas.height = windowHeight;

const ctx = canvas.getContext("2d");
let balls;

if (windowWidth <= mobileScreenWidth) {
    const btnStart = document.getElementById("btn-mob-start");
    const btnRefresh = document.getElementById("btn-mob-reset");
    const btnDecrease = document.getElementById("btn-mob-decrease");

    btnStart.addEventListener("click", () => {
        isActiveAnimation = !isActiveAnimation;
    });

    btnRefresh.addEventListener("click", () => {
        isActiveAnimation = false;
        maxRadiusSmallestBall = startRadius;
        balls = [];

        initBalls();

        drawingInitPosition(balls);
    });

    btnDecrease.addEventListener("click", () => {
        if (maxRadiusSmallestBall < 2.5) maxRadiusSmallestBall = 2.5;

        if (maxRadiusSmallestBall > 2.5) {
            const [smallBall] = balls.sort((a, b) => a.radius - b.radius);

            maxRadiusSmallestBall = smallBall.radius / 2;
        }
    });

    balls = [];
    speed = 2;
    indentX = 10;
    indentY = 10;
    startRadius = 30;

    initBalls();

    drawingInitPosition(balls);

    animateArc();
} else {
    balls = [
        {
            mouse: true,
            x: windowWidth - 15 - widthBorder - 8,
            y: 15 + 7,
            mass: 1,
            radius: 15,
            directionX: generateRandomCos(),
            directionY: generateRandomSin(),
        },
    ];

    let increaseRadiusInterval;
    let reductionRadiusInterval;

    initBalls();

    drawingInitPosition(balls);

    animateArc();

    document.addEventListener("mousedown", () => {
        clearInterval(reductionRadiusInterval);

        const [mouseBall] = balls.filter((ball) => ball.mouse);
        const maxRadius = 80;

        increaseRadiusInterval = setInterval(() => {
            if (mouseBall.radius < maxRadius) {
                mouseBall.radius += 4;
            }
        }, 17);
    });

    document.addEventListener("mouseup", () => {
        clearInterval(increaseRadiusInterval);

        const [mouseBall] = balls.filter((ball) => ball.mouse);

        reductionRadiusInterval = setInterval(() => {
            if (mouseBall.radius > 15) {
                mouseBall.radius -= 4;
            }
        }, 17);
    });

    document.addEventListener("mousemove", ({ clientX, clientY }) => {
        const mouseBall = balls.find((ball) => ball.mouse);

        mouseBall.x = clientX;
        mouseBall.y = clientY;

        if (!isActiveAnimation) {
            ctx.clearRect(0, 0, windowWidth, windowHeight);

            drawingInitPosition(balls);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.keyCode === codeButtonRefreshAnimate) {
            isActiveAnimation = false;
            balls = balls.filter((ball) => ball.mouse);
            maxRadiusSmallestBall = startRadius;

            if (isActiveAnimation) {
                overlayBlock.style.display = "none";
            } else {
                overlayBlock.style.display = "flex";
            }

            initBalls();

            drawingInitPosition(balls);
        }

        if (event.keyCode === codeButtonAnimateControl) {
            isActiveAnimation = !isActiveAnimation;

            if (isActiveAnimation) {
                overlayBlock.style.display = "none";
            } else {
                overlayBlock.style.display = "flex";
            }
        }

        if (maxRadiusSmallestBall < 5) maxRadiusSmallestBall = 5;

        if (event.keyCode === 40 && maxRadiusSmallestBall > 5) {
            const [smallBall] = balls
                .filter((ball) => !ball.mouse)
                .sort((a, b) => a.radius - b.radius);

            maxRadiusSmallestBall = smallBall.radius / 2;
        }
    });
}

function initBalls() {
    const countBallX = Math.floor(windowWidth / ((startRadius + indentX) * 2));
    const countBallY = Math.floor(windowHeight / ((startRadius + indentY) * 2));

    for (let i = 1; i <= countBallX; i++) {
        for (let j = 1; j <= countBallY; j++) {
            balls.push({
                x:
                    (startRadius + indentX) * (i - 1) +
                    (startRadius + indentX) * i,
                y:
                    (startRadius + indentY) * (j - 1) +
                    (startRadius + indentY) * j,
                radius: startRadius,
                mass: 1,
                directionX: generateRandomCos(),
                directionY: generateRandomSin(),
            });
        }
    }

    const valueForCenteredX = Math.floor(
        (windowWidth - balls[balls.length - 1].x + startRadius) / countBallX
    );
    const valueForCenteredY = Math.floor(
        (windowHeight - balls[balls.length - 1].y + startRadius) / countBallY
    );

    for (let i = 0; i < balls.length; i++) {
        if (balls[i].mouse) continue;

        if (windowWidth <= mobileScreenWidth) {
            balls[i].x += valueForCenteredX / 1.5;
            balls[i].y += valueForCenteredY;
        } else {
            balls[i].x += valueForCenteredX;
            balls[i].y += valueForCenteredY;
        }
    }

    const lastBall = balls[balls.length - 1];
    balls[balls.length - 1] = balls[0];
    balls[0] = lastBall;
}

function rotate(ball, angle) {
    const { x: dx, y: dy } = ball;

    return {
        x: dx * Math.cos(angle) - dy * Math.sin(angle),
        y: dx * Math.sin(angle) + dy * Math.cos(angle),
    };
}

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);

    if (ball.y > centerY) {
        ctx.fillStyle = colors.yellow;
    } else {
        ctx.fillStyle = colors.blue;
    }

    if (ball.mouse) {
        ctx.strokeStyle = colors.red;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = colors.red;
        ctx.fill();
        return;
    }

    ctx.fill();
}

function generateRandomCos() {
    return Math.cos(Math.random() * (Math.PI * 2)) * speed;
}

function generateRandomSin() {
    return Math.sin(Math.random() * (Math.PI * 2)) * speed;
}

function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

function ballsChangeDirection(ball, otherBall) {
    const angle = -Math.atan2(otherBall.y - ball.y, otherBall.x - ball.x);

    let m1 = ball.mass;
    let m2 = otherBall.mass;

    const u1 = rotate(
        {
            x: ball.directionX,
            y: ball.directionY,
        },
        angle
    );
    const u2 = rotate(
        {
            x: otherBall.directionX,
            y: otherBall.directionY,
        },
        angle
    );

    const v1 = {
        x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
        y: u1.y,
    };
    const v2 = {
        x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
        y: u2.y,
    };

    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    ball.directionX = vFinal1.x;
    ball.directionY = vFinal1.y;

    otherBall.directionX = vFinal2.x;
    otherBall.directionY = vFinal2.y;
}

function toSplitBall(ball) {
    const newBall = {
        ...ball,
        x: ball.x - ball.radius / 2,
        y: ball.y - ball.radius / 2,
        mass: 1,
        radius: ball.radius / 2,
        directionX: generateRandomCos(),
        directionY: generateRandomSin(),
    };

    balls.push(newBall);

    ball.x = ball.x + ball.radius / 2;
    ball.y = ball.y + ball.radius / 2;
    ball.radius = ball.radius / 2;

    return newBall;
}

function drawingInitPosition(balls) {
    ctx.clearRect(0, 0, windowWidth, windowHeight);

    balls.forEach((ball) => {
        drawBall(ball);
    });
}

function moveBall(ball) {
    if (ball.x + ball.radius >= windowWidth - widthBorder) {
        ball.x = windowWidth - widthBorder - ball.radius;
    }

    if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius + widthBorder;
    }

    if (ball.y + ball.radius >= windowHeight - widthBorder) {
        ball.y = windowHeight - widthBorder - ball.radius;
    }

    if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius + widthBorder;
    }

    if (!ball.mouse) {
        ball.x += ball.directionX;
        ball.y += ball.directionY;
    }

    if (
        ball.x + ball.radius >= windowWidth - widthBorder ||
        ball.x - ball.radius <= 0
    ) {
        ball.directionX *= -1;
    }

    if (
        ball.y + ball.radius >= windowHeight - widthBorder ||
        ball.y - ball.radius <= 0
    ) {
        ball.directionY *= -1;
    }
}

function resolveCollision(ball, otherBall, dist) {
    if (dist - (ball.radius + otherBall.radius) <= 0) {
        if (ball.mouse || otherBall.mouse) {
            const simpleBall = [ball, otherBall].filter((b) => !b.mouse)[0];
            const mouseBall = [ball, otherBall].filter((b) => b.mouse)[0];

            mouseBall.directionX = simpleBall.directionX * -1;
            mouseBall.directionY = simpleBall.directionY * -1;
        }

        const xDirectionDiff = ball.directionX - otherBall.directionX;
        const yDirectionDiff = ball.directionY - otherBall.directionY;

        const xDist = otherBall.x - ball.x;
        const yDist = otherBall.y - ball.y;

        if (xDirectionDiff * xDist + yDirectionDiff * yDist >= 0) {
            ballsChangeDirection(ball, otherBall);

            const [splitBall, otherSplitBall] = [ball, otherBall].sort(
                (a, b) => b.radius - a.radius
            );

            if (splitBall.radius > maxRadiusSmallestBall && !splitBall.mouse) {
                balls.map((currentBall) => {
                    if (currentBall === splitBall) {
                        const newBall = toSplitBall(currentBall);

                        ballsChangeDirection(newBall, splitBall);

                        ballsChangeDirection(currentBall, otherSplitBall);
                    }
                });
            }
        }
    }
}

function animateArc() {
    requestAnimationFrame(animateArc);

    if (isActiveAnimation) {
        ctx.clearRect(0, 0, windowWidth, windowHeight);

        balls.forEach((ball) => {
            drawBall(ball);

            for (let i = 0; i < balls.length; i++) {
                if (balls[i] === ball || balls[i].mouse) continue;

                const otherBall = balls[i];
                const dist = distance(ball.x, ball.y, otherBall.x, otherBall.y);

                resolveCollision(ball, otherBall, dist);
            }

            moveBall(ball);
        });
    }
}
