# Разница между ? и ! 

## ? - optional chaining 

```ts 
let user = auth.credentials?.name // если undefined то:
console.log(user) // -> undefined 
```
если undefined то вернет undefined | в выражении
+ при таком способе ты реально проверяешь есть ли значение
+ не получишь runtime ошибку

## ! - non null assertion

```ts
let user = auth.credentials!.name // если undefined:
console.log(user) // -> получишь  runtime ошибку если undefined 
// типо такой: Cannot read property 'name' of undefined
```
- ничего не проверяет , типо поверь мне на слово там не undefined
- работает только на уровне типов в рантайме он просто ничего не значит исчезает

## Юскейсы

! - Использовать если не уверен на 100% что значение не undefined (дает понять что значение мб undefined)
? - Когда точно уверен , например есть проверка строкой вышы

```ts
// ✅ ?. — когда нет гарантии
const name = user?.profile?.name; // мб undefined, это ок

// ✅ ! — когда есть проверка строкой выше
if (user.profile) {
  const name = user.profile!.name; // я уже проверил, TS может не париться
}

// ❌ ! — когда проверки нет (опасно!)
const name = user.profile!.name; // если undefined → runtime ошибка
```