using UnityEngine;
using UnityEngine.EventSystems;

public class PanelMove : MonoBehaviour, IPointerClickHandler, IPointerEnterHandler, IPointerExitHandler {

    RectTransform UIGameobject; // трансформ UI Панели

    float width; // ширина панели
    float changeX; // значение содержащее смещение панели
    float speedPanel; // скорость закрытия панели

    enum states // перечисление состояний панели
    {
        open,//открыта
        close,//закрыта
        opening,//открывается
        closing//закрывается
    }

    states state = states.open; // изначальное состояние закрытое

    // Use this for initialization
    void Start()
    {
        UIGameobject = gameObject.GetComponent<RectTransform>(); // инициализируем переменную трансформа
        width = UIGameobject.sizeDelta.x / 1; // определение ширины панели
        speedPanel = 8; // инициализация скорости закрытия панели 
    }

    // Update is called once per frame
    void Update()
    {
        if (state == states.closing)
        {
            float x = UIGameobject.anchoredPosition.x;
            float y = UIGameobject.anchoredPosition.y;

            x += speedPanel;
            changeX += speedPanel;
            UIGameobject.anchoredPosition = new Vector2(x, y);

            if (changeX > width)
            {
                state = states.close;
                changeX = 0;
            }
        }

        if (state == states.opening)
        {
            float x = UIGameobject.anchoredPosition.x;
            float y = UIGameobject.anchoredPosition.y;

            x -= speedPanel;
            changeX += speedPanel;
            UIGameobject.anchoredPosition = new Vector2(x, y);

            if (changeX > width)
            {
                state = states.open;
                changeX = 0;
            }
        }
    }

    public void OnPointerClick(PointerEventData eventData)
    {
    }

    public void OnPointerEnter(PointerEventData eventData)
    {
        if (state == states.close) state = states.opening;
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        if (state == states.open) state = states.closing;
    }
}
