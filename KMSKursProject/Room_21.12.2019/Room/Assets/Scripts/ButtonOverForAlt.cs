using System.Collections;
using UnityEngine;
using UnityEngine.EventSystems;

public class ButtonOverForAlt : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
{
    [SerializeField]
    GameObject alt;

    bool overButton;

    // Start is called before the first frame update
    void Start()
    {
        alt.SetActive(false);
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        print("OnPointerExit");
        overButton = false;
        alt.SetActive(false);
    }

    //отображение подсказки при наведении курсора мыши
    public void OnPointerEnter(PointerEventData eventData)
    {
        print("OnPointerEnter");
        overButton = true;
        StartCoroutine(HideAlt());
    }


    IEnumerator HideAlt() {
        yield return new WaitForSeconds(1f);
        if (overButton) alt.SetActive(true);
    }

}
