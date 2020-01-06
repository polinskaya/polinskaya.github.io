using UnityEngine;

namespace Assets.Scripts.EventSystem
{
    public class EventManager : MonoBehaviour {

        public delegate void SwitchHandler(bool work);//включение установки
        public delegate void MoveHandler();//перемещние камеры к окуляру
        public delegate void SetScrollValueHandler(int objectIndex);//перемещние камеры к окуляру
        public delegate void SwitchTargetPosHandler(Transform target);//смена камер
        public delegate void HandlerColorChanger(float color);//поворот линзы
        public delegate bool HandlerValues();//запись в таблицу


        public static event SwitchHandler Switch;//переключение
        public static event MoveHandler Moved;//перемещение
        public static event SetScrollValueHandler ScrollValuesSeted;//перемещение
        public static event SwitchTargetPosHandler SwitchTarget;//перемещение
        public static event HandlerColorChanger AmpChanger;//смена значения ампрметра
        public static event HandlerValues WritingValue;//запись значения

        private void Start()
        {
            if (Switch != null) Switch(false);
        }

        public static void SwitchWork(bool work)//просто метод, который будет вызвать событие
        {
            if (Switch != null) Switch(work); //вызываем событие для подписчиков
        }
    
        public static void MovedCamera()//просто метод, который будет вызвать событие
        {
            if (Moved != null) Moved(); //вызываем событие для подписчиков
            
        }

        public static void SetScrollValues(int objectIndex)
        {
            if (ScrollValuesSeted != null) ScrollValuesSeted(objectIndex);
        }

        public static void SetTargetPos(Transform target)
        {
            if (SwitchTarget != null) SwitchTarget(target);
        }

        public static void ChangeAmps(float color)
        {
            if (AmpChanger != null) AmpChanger(color);
        }

        public static bool WriteValue()
        {
            if (WritingValue != null && WritingValue())
            {
                return true;
            }
            else return false;
        }


        public static float ToPersent(float min, float max, float value)
        {
            return Mathf.Abs((min - value) / (max - min));
        }

        public static float FromPersent(float min, float max, float persent)
        {
            return (max-min)*persent+min;
        }
    }
}
