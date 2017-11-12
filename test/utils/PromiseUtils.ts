export default class PromiseUtils {
  public static delay(sec: number): Promise<void> {
    return new Promise((resolve, reject) => setTimeout(resolve, sec * 1000));
  }
}
