using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

public class MouseOver : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
{
    [SerializeField]
    Tasks tasks;

    [SerializeField]
    TextPanel table;

    [SerializeField]
    Image button;

    [SerializeField]
    public Sprite buttonNormalState;
    public Sprite buttonHighlightedState;

    public void OnPointerEnter(PointerEventData eventData)//когда подсветили
    {
        if (button != null) button.sprite = buttonHighlightedState;
        if (gameObject.name == "PracticePanel") tasks.Open();
        if (gameObject.name == "TableButton") table.Open("");
        if (gameObject.name == "Question") table.Open("  " +
                                                      " Для управления <b><color=#ff9300>камерой</color></b> в симуляторе используйте колёсико мышки для приближение и отдаления, а также зажимайте правую кнопку мыши для поворота по горизонтали. \n \n " +
                                                      "  В правом верхнем углу экрана располагается <b><color=#ff9300>меню</color></b> для выполнения лабораторной работы. Для того, чтобы раскрыть его, наведите на него мышью. \n \n  " +
                                                      " В пункте меню <b><color=#ff9300>«Установка»</color></b> находится список используемых в установке компонент. При наведении на какой-либо из них, он подсветится и в строке сообщений выведется соответствующее описание. \n \n   При выборе пункта меню <b><color=#ff9300>«Практика»</color></b> отображается строка сообщений, в которой выводятся задания, которые необходимо выполнить, а также несколько кнопок: первая кнопка предназначена для записи текущего показания в таблицу, вторая - для вывода таблицы с записанными значениями, а третья для её очистки от введённых данных.");
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        if (gameObject.name == "PracticePanel") button.sprite = buttonNormalState;
        if (gameObject.name == "TableButton") table.Close();
        if (gameObject.name == "Question") table.Close();
    }
}
